import { useEffect, useState } from 'react';

import { useAppDatabase } from '@/src/lib/db';
import type { TimetableSlotRecord } from '@/src/lib/database';

export type TimetableSlot = TimetableSlotRecord & {
  subjectColor: string;
  subjectName: string;
};

function makeSlotId() {
  return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useTimetable() {
  const db = useAppDatabase();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSlots() {
      const rows = await db.getAllAsync<TimetableSlot>(
        `SELECT
          timetable_slots.*,
          subjects.name AS subjectName,
          subjects.color AS subjectColor
        FROM timetable_slots
        INNER JOIN subjects ON subjects.id = timetable_slots.subjectId
        ORDER BY timetable_slots.dayOfWeek ASC, timetable_slots.startTime ASC, timetable_slots.sortOrder ASC`
      );

      if (isMounted) {
        setSlots(rows);
        setIsLoading(false);
      }
    }

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function refreshSlots() {
    const rows = await db.getAllAsync<TimetableSlot>(
      `SELECT
        timetable_slots.*,
        subjects.name AS subjectName,
        subjects.color AS subjectColor
      FROM timetable_slots
      INNER JOIN subjects ON subjects.id = timetable_slots.subjectId
      ORDER BY timetable_slots.dayOfWeek ASC, timetable_slots.startTime ASC, timetable_slots.sortOrder ASC`
    );

    setSlots(rows);
  }

  async function addSlot(input: {
    dayOfWeek: number;
    endTime: string;
    location?: string;
    notes?: string;
    startTime: string;
    subjectId: string;
  }) {
    const startTime = input.startTime.trim();
    const endTime = input.endTime.trim();

    if (!startTime || !endTime) {
      return;
    }

    const now = new Date().toISOString();
    const existingCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM timetable_slots WHERE dayOfWeek = ?',
      [input.dayOfWeek]
    );

    await db.runAsync(
      `INSERT INTO timetable_slots
        (id, dayOfWeek, startTime, endTime, subjectId, location, notes, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        makeSlotId(),
        input.dayOfWeek,
        startTime,
        endTime,
        input.subjectId,
        input.location?.trim() || null,
        input.notes?.trim() || null,
        existingCount?.count ?? 0,
        now,
        now,
      ]
    );

    await refreshSlots();
  }

  async function removeSlot(id: string) {
    await db.runAsync('DELETE FROM timetable_slots WHERE id = ?', [id]);
    await refreshSlots();
  }

  return {
    slots,
    isLoading,
    addSlot,
    removeSlot,
  };
}
