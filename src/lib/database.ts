import type { AppDatabase } from '@/src/lib/db';

export type SubjectRecord = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TodoRecord = {
  id: string;
  subjectId: string;
  title: string;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
};

export type TimetableSlotRecord = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  location: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardDeckRecord = {
  id: string;
  subjectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardRecord = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
};

export async function initializeDatabase(db: AppDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      dueAt TEXT,
      completedAt TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(subjectId) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY NOT NULL,
      dayOfWeek INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(subjectId) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcard_decks (
      id TEXT PRIMARY KEY NOT NULL,
      subjectId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(subjectId) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      deckId TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(deckId) REFERENCES flashcard_decks(id) ON DELETE CASCADE
    );
  `);
}
