import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import type {
  FlashcardDeckRecord,
  FlashcardRecord,
  SubjectRecord,
  TimetableSlotRecord,
  TodoRecord,
} from '@/src/lib/database';

export type AppDatabase = {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  runAsync(sql: string, params?: unknown[]): Promise<void>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

type DatabaseProviderProps = {
  children: ReactNode;
  databaseName: string;
  onInit?: (db: AppDatabase) => Promise<void> | void;
};

type PersistedState = {
  flashcardDecks: FlashcardDeckRecord[];
  flashcards: FlashcardRecord[];
  subjects: SubjectRecord[];
  timetableSlots: TimetableSlotRecord[];
  todos: TodoRecord[];
};

const STORAGE_PREFIX = 'planora-web-db';
const defaultState = (): PersistedState => ({
  flashcardDecks: [],
  flashcards: [],
  subjects: [],
  timetableSlots: [],
  todos: [],
});

const DatabaseContext = createContext<AppDatabase | null>(null);
let serverStateCache: Record<string, PersistedState> = {};

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneState(state: PersistedState): PersistedState {
  return JSON.parse(JSON.stringify(state)) as PersistedState;
}

function sortSubjects(subjects: SubjectRecord[]) {
  return [...subjects].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.createdAt.localeCompare(right.createdAt);
  });
}

function sortTodos(todos: TodoRecord[]) {
  const priorityRank: Record<TodoRecord['priority'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...todos].sort((left, right) => {
    const completedRankLeft = left.completedAt ? 1 : 0;
    const completedRankRight = right.completedAt ? 1 : 0;
    if (completedRankLeft !== completedRankRight) {
      return completedRankLeft - completedRankRight;
    }

    if (priorityRank[left.priority] !== priorityRank[right.priority]) {
      return priorityRank[left.priority] - priorityRank[right.priority];
    }

    const dueLeft = left.dueAt ?? left.createdAt;
    const dueRight = right.dueAt ?? right.createdAt;
    if (dueLeft !== dueRight) {
      return dueLeft.localeCompare(dueRight);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

function sortSlots(slots: TimetableSlotRecord[]) {
  return [...slots].sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }
    if (left.startTime !== right.startTime) {
      return left.startTime.localeCompare(right.startTime);
    }
    return left.sortOrder - right.sortOrder;
  });
}

function loadState(databaseName: string): PersistedState {
  const key = `${STORAGE_PREFIX}:${databaseName}`;

  if (canUseLocalStorage()) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return defaultState();
    }

    try {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        flashcardDecks: parsed.flashcardDecks ?? [],
        flashcards: parsed.flashcards ?? [],
        subjects: parsed.subjects ?? [],
        timetableSlots: parsed.timetableSlots ?? [],
        todos: parsed.todos ?? [],
      };
    } catch {
      return defaultState();
    }
  }

  return serverStateCache[key] ?? defaultState();
}

function saveState(databaseName: string, state: PersistedState) {
  const key = `${STORAGE_PREFIX}:${databaseName}`;

  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, JSON.stringify(state));
    return;
  }

  serverStateCache[key] = cloneState(state);
}

class WebDatabase implements AppDatabase {
  constructor(private readonly databaseName: string) {}

  async execAsync(_sql: string) {}

  async getAllAsync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const state = loadState(this.databaseName);

    if (normalizedSql === 'SELECT * FROM subjects ORDER BY sortOrder ASC, createdAt ASC') {
      return sortSubjects(state.subjects) as T[];
    }

    if (normalizedSql === 'SELECT id FROM subjects ORDER BY sortOrder ASC, createdAt ASC') {
      return sortSubjects(state.subjects).map((subject) => ({ id: subject.id })) as T[];
    }

    if (
      normalizedSql.includes('FROM todos INNER JOIN subjects ON subjects.id = todos.subjectId')
    ) {
      const rows = sortTodos(state.todos)
        .map((todo) => {
          const subject = state.subjects.find((candidate) => candidate.id === todo.subjectId);
          if (!subject) {
            return null;
          }

          return {
            ...todo,
            subjectColor: subject.color,
            subjectName: subject.name,
          };
        })
        .filter(Boolean) as T[];

      return rows;
    }

    if (
      normalizedSql.includes(
        'FROM timetable_slots INNER JOIN subjects ON subjects.id = timetable_slots.subjectId'
      )
    ) {
      const rows = sortSlots(state.timetableSlots)
        .map((slot) => {
          const subject = state.subjects.find((candidate) => candidate.id === slot.subjectId);
          if (!subject) {
            return null;
          }

          return {
            ...slot,
            subjectColor: subject.color,
            subjectName: subject.name,
          };
        })
        .filter(Boolean) as T[];

      return rows;
    }

    if (
      normalizedSql.includes('FROM flashcard_decks') &&
      normalizedSql.includes('COUNT(flashcards.id) AS cardCount')
    ) {
      const rows = sortSubjects(state.subjects)
        .map((subject) => {
          const deck = state.flashcardDecks.find((candidate) => candidate.subjectId === subject.id);
          if (!deck) {
            return null;
          }

          return {
            cardCount: state.flashcards.filter((card) => card.deckId === deck.id).length,
            deckId: deck.id,
            deckName: deck.name,
            subjectColor: subject.color,
            subjectId: subject.id,
            subjectName: subject.name,
          };
        })
        .filter(Boolean) as T[];

      return rows;
    }

    if (
      normalizedSql.includes('FROM flashcards') &&
      normalizedSql.includes('INNER JOIN flashcard_decks ON flashcard_decks.id = flashcards.deckId')
    ) {
      const subjectOrder = new Map(sortSubjects(state.subjects).map((subject, index) => [subject.id, index]));

      const rows = [...state.flashcards]
        .map((card) => {
          const deck = state.flashcardDecks.find((candidate) => candidate.id === card.deckId);
          if (!deck) {
            return null;
          }

          const subject = state.subjects.find((candidate) => candidate.id === deck.subjectId);
          if (!subject) {
            return null;
          }

          return {
            ...card,
            subjectColor: subject.color,
            subjectId: subject.id,
            subjectName: subject.name,
          };
        })
        .filter(Boolean)
        .sort((left: any, right: any) => {
          const orderLeft = subjectOrder.get(left.subjectId) ?? Number.MAX_SAFE_INTEGER;
          const orderRight = subjectOrder.get(right.subjectId) ?? Number.MAX_SAFE_INTEGER;
          if (orderLeft !== orderRight) {
            return orderLeft - orderRight;
          }
          return left.createdAt.localeCompare(right.createdAt);
        }) as T[];

      return rows;
    }

    throw new Error(`Unsupported getAllAsync query on web: ${normalizedSql} :: ${JSON.stringify(params)}`);
  }

  async getFirstAsync<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const state = loadState(this.databaseName);

    if (normalizedSql === 'SELECT COUNT(*) AS count FROM timetable_slots WHERE dayOfWeek = ?') {
      const dayOfWeek = Number(params[0] ?? 0);
      return {
        count: state.timetableSlots.filter((slot) => slot.dayOfWeek === dayOfWeek).length,
      } as T;
    }

    if (normalizedSql === 'SELECT id AS deckId FROM flashcard_decks WHERE subjectId = ?') {
      const subjectId = String(params[0] ?? '');
      const deck = state.flashcardDecks.find((candidate) => candidate.subjectId === subjectId);
      return (deck ? { deckId: deck.id } : null) as T | null;
    }

    if (normalizedSql === 'SELECT name FROM subjects WHERE id = ?') {
      const subjectId = String(params[0] ?? '');
      const subject = state.subjects.find((candidate) => candidate.id === subjectId);
      return (subject ? { name: subject.name } : null) as T | null;
    }

    throw new Error(`Unsupported getFirstAsync query on web: ${normalizedSql} :: ${JSON.stringify(params)}`);
  }

  async runAsync(sql: string, params: unknown[] = []): Promise<void> {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const state = loadState(this.databaseName);

    if (normalizedSql.startsWith('INSERT INTO subjects')) {
      state.subjects.push({
        color: String(params[2] ?? ''),
        createdAt: String(params[4] ?? ''),
        id: String(params[0] ?? ''),
        name: String(params[1] ?? ''),
        sortOrder: Number(params[3] ?? 0),
        updatedAt: String(params[5] ?? ''),
      });
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'DELETE FROM subjects WHERE id = ?') {
      const subjectId = String(params[0] ?? '');
      state.subjects = state.subjects.filter((subject) => subject.id !== subjectId);
      state.todos = state.todos.filter((todo) => todo.subjectId !== subjectId);
      state.timetableSlots = state.timetableSlots.filter((slot) => slot.subjectId !== subjectId);

      const deckIds = state.flashcardDecks
        .filter((deck) => deck.subjectId === subjectId)
        .map((deck) => deck.id);
      state.flashcardDecks = state.flashcardDecks.filter((deck) => deck.subjectId !== subjectId);
      state.flashcards = state.flashcards.filter((card) => !deckIds.includes(card.deckId));

      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'UPDATE subjects SET sortOrder = ?, updatedAt = ? WHERE id = ?') {
      const [sortOrder, updatedAt, id] = params;
      state.subjects = state.subjects.map((subject) =>
        subject.id === id
          ? { ...subject, sortOrder: Number(sortOrder ?? 0), updatedAt: String(updatedAt ?? '') }
          : subject
      );
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql.startsWith('INSERT INTO todos')) {
      state.todos.push({
        completedAt: params[5] ? String(params[5]) : null,
        createdAt: String(params[7] ?? ''),
        dueAt: params[4] ? String(params[4]) : null,
        id: String(params[0] ?? ''),
        notes: params[3] ? String(params[3]) : null,
        priority: String(params[6] ?? 'medium') as TodoRecord['priority'],
        subjectId: String(params[1] ?? ''),
        title: String(params[2] ?? ''),
        updatedAt: String(params[8] ?? ''),
      });
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'UPDATE todos SET completedAt = ?, updatedAt = ? WHERE id = ?') {
      const [completedAt, updatedAt, id] = params;
      state.todos = state.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completedAt: completedAt ? String(completedAt) : null,
              updatedAt: String(updatedAt ?? ''),
            }
          : todo
      );
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'DELETE FROM todos WHERE id = ?') {
      const id = String(params[0] ?? '');
      state.todos = state.todos.filter((todo) => todo.id !== id);
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql.startsWith('INSERT INTO timetable_slots')) {
      state.timetableSlots.push({
        createdAt: String(params[8] ?? ''),
        dayOfWeek: Number(params[1] ?? 0),
        endTime: String(params[3] ?? ''),
        id: String(params[0] ?? ''),
        location: params[5] ? String(params[5]) : null,
        notes: params[6] ? String(params[6]) : null,
        sortOrder: Number(params[7] ?? 0),
        startTime: String(params[2] ?? ''),
        subjectId: String(params[4] ?? ''),
        updatedAt: String(params[9] ?? ''),
      });
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'DELETE FROM timetable_slots WHERE id = ?') {
      const id = String(params[0] ?? '');
      state.timetableSlots = state.timetableSlots.filter((slot) => slot.id !== id);
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql.startsWith('INSERT INTO flashcard_decks')) {
      state.flashcardDecks.push({
        createdAt: String(params[3] ?? ''),
        id: String(params[0] ?? ''),
        name: String(params[2] ?? ''),
        subjectId: String(params[1] ?? ''),
        updatedAt: String(params[4] ?? ''),
      });
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql.startsWith('INSERT INTO flashcards')) {
      state.flashcards.push({
        back: String(params[3] ?? ''),
        createdAt: String(params[4] ?? ''),
        deckId: String(params[1] ?? ''),
        front: String(params[2] ?? ''),
        id: String(params[0] ?? ''),
        updatedAt: String(params[5] ?? ''),
      });
      saveState(this.databaseName, state);
      return;
    }

    if (normalizedSql === 'DELETE FROM flashcards WHERE id = ?') {
      const id = String(params[0] ?? '');
      state.flashcards = state.flashcards.filter((card) => card.id !== id);
      saveState(this.databaseName, state);
      return;
    }

    throw new Error(`Unsupported runAsync query on web: ${normalizedSql} :: ${JSON.stringify(params)}`);
  }

  async withTransactionAsync(task: () => Promise<void>) {
    const snapshot = cloneState(loadState(this.databaseName));

    try {
      await task();
    } catch (error) {
      saveState(this.databaseName, snapshot);
      throw error;
    }
  }
}

export function DatabaseProvider({ children, databaseName, onInit }: DatabaseProviderProps) {
  const dbRef = useRef<AppDatabase | null>(null);

  if (!dbRef.current) {
    dbRef.current = new WebDatabase(databaseName);
  }

  useEffect(() => {
    if (onInit && dbRef.current) {
      void onInit(dbRef.current);
    }
  }, [onInit]);

  return <DatabaseContext.Provider value={dbRef.current}>{children}</DatabaseContext.Provider>;
}

export function useAppDatabase() {
  const db = useContext(DatabaseContext);

  if (!db) {
    throw new Error('Database context is not available.');
  }

  return db;
}
