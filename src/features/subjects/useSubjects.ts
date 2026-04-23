import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { SubjectRecord } from '@/src/lib/database';

function makeSubjectId() {
  return `subject_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useSubjects() {
  const db = useSQLiteContext();
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSubjects() {
      const rows = await db.getAllAsync<SubjectRecord>(
        'SELECT * FROM subjects ORDER BY sortOrder ASC, createdAt ASC'
      );

      if (isMounted) {
        setSubjects(rows);
        setIsLoading(false);
      }
    }

    loadSubjects();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function refreshSubjects() {
    const rows = await db.getAllAsync<SubjectRecord>(
      'SELECT * FROM subjects ORDER BY sortOrder ASC, createdAt ASC'
    );
    setSubjects(rows);
  }

  async function addSubject({ color, name }: { color: string; name: string }) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const now = new Date().toISOString();
    const nextSortOrder = subjects.length;

    await db.runAsync(
      `INSERT INTO subjects (id, name, color, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [makeSubjectId(), trimmedName, color, nextSortOrder, now, now]
    );

    await refreshSubjects();
  }

  async function removeSubject(id: string) {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);

      const remaining = await db.getAllAsync<Pick<SubjectRecord, 'id'>>(
        'SELECT id FROM subjects ORDER BY sortOrder ASC, createdAt ASC'
      );

      for (const [index, subject] of remaining.entries()) {
        await db.runAsync('UPDATE subjects SET sortOrder = ?, updatedAt = ? WHERE id = ?', [
          index,
          new Date().toISOString(),
          subject.id,
        ]);
      }
    });

    await refreshSubjects();
  }

  return {
    subjects,
    isLoading,
    addSubject,
    removeSubject,
  };
}
