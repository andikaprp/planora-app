import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

type FlashcardDeckSummary = {
  cardCount: number;
  deckId: string;
  deckName: string;
  subjectColor: string;
  subjectId: string;
  subjectName: string;
};

export type FlashcardItem = {
  back: string;
  createdAt: string;
  deckId: string;
  front: string;
  id: string;
  subjectColor: string;
  subjectId: string;
  subjectName: string;
  updatedAt: string;
};

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useFlashcards() {
  const db = useSQLiteContext();
  const [decks, setDecks] = useState<FlashcardDeckSummary[]>([]);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [deckRows, cardRows] = await Promise.all([
        db.getAllAsync<FlashcardDeckSummary>(
          `SELECT
            flashcard_decks.id AS deckId,
            flashcard_decks.name AS deckName,
            flashcard_decks.subjectId AS subjectId,
            subjects.name AS subjectName,
            subjects.color AS subjectColor,
            COUNT(flashcards.id) AS cardCount
          FROM flashcard_decks
          INNER JOIN subjects ON subjects.id = flashcard_decks.subjectId
          LEFT JOIN flashcards ON flashcards.deckId = flashcard_decks.id
          GROUP BY flashcard_decks.id, flashcard_decks.name, flashcard_decks.subjectId, subjects.name, subjects.color
          ORDER BY subjects.sortOrder ASC, subjects.createdAt ASC`
        ),
        db.getAllAsync<FlashcardItem>(
          `SELECT
            flashcards.*,
            flashcard_decks.subjectId AS subjectId,
            subjects.name AS subjectName,
            subjects.color AS subjectColor
          FROM flashcards
          INNER JOIN flashcard_decks ON flashcard_decks.id = flashcards.deckId
          INNER JOIN subjects ON subjects.id = flashcard_decks.subjectId
          ORDER BY subjects.sortOrder ASC, flashcards.createdAt ASC`
        ),
      ]);

      if (isMounted) {
        setDecks(deckRows);
        setCards(cardRows);
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function refreshData() {
    const [deckRows, cardRows] = await Promise.all([
      db.getAllAsync<FlashcardDeckSummary>(
        `SELECT
          flashcard_decks.id AS deckId,
          flashcard_decks.name AS deckName,
          flashcard_decks.subjectId AS subjectId,
          subjects.name AS subjectName,
          subjects.color AS subjectColor,
          COUNT(flashcards.id) AS cardCount
        FROM flashcard_decks
        INNER JOIN subjects ON subjects.id = flashcard_decks.subjectId
        LEFT JOIN flashcards ON flashcards.deckId = flashcard_decks.id
        GROUP BY flashcard_decks.id, flashcard_decks.name, flashcard_decks.subjectId, subjects.name, subjects.color
        ORDER BY subjects.sortOrder ASC, subjects.createdAt ASC`
      ),
      db.getAllAsync<FlashcardItem>(
        `SELECT
          flashcards.*,
          flashcard_decks.subjectId AS subjectId,
          subjects.name AS subjectName,
          subjects.color AS subjectColor
        FROM flashcards
        INNER JOIN flashcard_decks ON flashcard_decks.id = flashcards.deckId
        INNER JOIN subjects ON subjects.id = flashcard_decks.subjectId
        ORDER BY subjects.sortOrder ASC, flashcards.createdAt ASC`
      ),
    ]);

    setDecks(deckRows);
    setCards(cardRows);
  }

  async function getOrCreateDeck(subjectId: string) {
    const existingDeck = await db.getFirstAsync<{ deckId: string }>(
      'SELECT id AS deckId FROM flashcard_decks WHERE subjectId = ?',
      [subjectId]
    );

    if (existingDeck?.deckId) {
      return existingDeck.deckId;
    }

    const subject = await db.getFirstAsync<{ name: string }>(
      'SELECT name FROM subjects WHERE id = ?',
      [subjectId]
    );

    const now = new Date().toISOString();
    const deckId = makeId('deck');
    const deckName = subject?.name ? `${subject.name} deck` : 'Flashcard deck';

    await db.runAsync(
      `INSERT INTO flashcard_decks (id, subjectId, name, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [deckId, subjectId, deckName, now, now]
    );

    return deckId;
  }

  async function addFlashcard(input: { back: string; front: string; subjectId: string }) {
    const front = input.front.trim();
    const back = input.back.trim();

    if (!front || !back) {
      return;
    }

    const deckId = await getOrCreateDeck(input.subjectId);
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO flashcards (id, deckId, front, back, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [makeId('card'), deckId, front, back, now, now]
    );

    await refreshData();
  }

  async function removeFlashcard(id: string) {
    await db.runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
    await refreshData();
  }

  return {
    decks,
    cards,
    isLoading,
    addFlashcard,
    removeFlashcard,
  };
}
