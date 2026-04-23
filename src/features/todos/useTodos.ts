import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { TodoRecord } from '@/src/lib/database';

type TodoRow = TodoRecord & {
  subjectColor: string;
  subjectName: string;
};

function makeTodoId() {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useTodos() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTodos() {
      const rows = await db.getAllAsync<TodoRow>(
        `SELECT
          todos.*,
          subjects.name AS subjectName,
          subjects.color AS subjectColor
        FROM todos
        INNER JOIN subjects ON subjects.id = todos.subjectId
        ORDER BY
          CASE WHEN todos.completedAt IS NULL THEN 0 ELSE 1 END,
          CASE todos.priority
            WHEN 'high' THEN 0
            WHEN 'medium' THEN 1
            ELSE 2
          END,
          COALESCE(todos.dueAt, todos.createdAt) ASC,
          todos.createdAt DESC`
      );

      if (isMounted) {
        setTodos(rows);
        setIsLoading(false);
      }
    }

    loadTodos();

    return () => {
      isMounted = false;
    };
  }, [db]);

  async function refreshTodos() {
    const rows = await db.getAllAsync<TodoRow>(
      `SELECT
        todos.*,
        subjects.name AS subjectName,
        subjects.color AS subjectColor
      FROM todos
      INNER JOIN subjects ON subjects.id = todos.subjectId
      ORDER BY
        CASE WHEN todos.completedAt IS NULL THEN 0 ELSE 1 END,
        CASE todos.priority
          WHEN 'high' THEN 0
          WHEN 'medium' THEN 1
          ELSE 2
        END,
        COALESCE(todos.dueAt, todos.createdAt) ASC,
        todos.createdAt DESC`
    );

    setTodos(rows);
  }

  async function addTodo(input: {
    dueAt?: string;
    notes?: string;
    priority: TodoRecord['priority'];
    subjectId: string;
    title: string;
  }) {
    const title = input.title.trim();

    if (!title) {
      return;
    }

    const now = new Date().toISOString();
    const notes = input.notes?.trim() || null;
    const dueAt = input.dueAt?.trim() || null;

    await db.runAsync(
      `INSERT INTO todos (id, subjectId, title, notes, dueAt, completedAt, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [makeTodoId(), input.subjectId, title, notes, dueAt, null, input.priority, now, now]
    );

    await refreshTodos();
  }

  async function toggleTodo(id: string, completed: boolean) {
    const now = new Date().toISOString();

    await db.runAsync('UPDATE todos SET completedAt = ?, updatedAt = ? WHERE id = ?', [
      completed ? null : now,
      now,
      id,
    ]);

    await refreshTodos();
  }

  async function removeTodo(id: string) {
    await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
    await refreshTodos();
  }

  return {
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    removeTodo,
  };
}
