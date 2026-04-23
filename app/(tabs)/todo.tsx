import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { useTodos } from '@/src/features/todos/useTodos';
import type { TodoRecord } from '@/src/lib/database';

const PRIORITIES: TodoRecord['priority'][] = ['high', 'medium', 'low'];

export default function TodoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { todos, isLoading: todosLoading, addTodo, toggleTodo, removeTodo } = useTodos();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TodoRecord['priority']>('medium');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  async function onCreateTodo() {
    if (!selectedSubjectId || !title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addTodo({
        dueAt,
        notes,
        priority,
        subjectId: selectedSubjectId,
        title,
      });

      setTitle('');
      setNotes('');
      setDueAt('');
      setPriority('medium');
    } catch (error) {
      Alert.alert('Could not save to-do', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  function onDeleteTodo(id: string, todoTitle: string) {
    Alert.alert('Delete to-do?', `Remove "${todoTitle}" from your task list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTodo(id);
          } catch (error) {
            Alert.alert(
              'Could not delete to-do',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>To-do</Text>
        <Text style={styles.title}>Plan the work that matters</Text>
        <Text style={styles.subtitle}>
          Capture assignments, attach them to a subject, and mark them off as you finish.
        </Text>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
        ]}>
        <Text style={styles.sectionTitle}>Create a task</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Example: Finish chemistry worksheet"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)'}
          style={[
            styles.input,
            {
              color: isDark ? '#FFFFFF' : '#0F172A',
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            },
          ]}
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)'}
          multiline
          style={[
            styles.input,
            styles.notesInput,
            {
              color: isDark ? '#FFFFFF' : '#0F172A',
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            },
          ]}
        />

        <TextInput
          value={dueAt}
          onChangeText={setDueAt}
          placeholder="Due date or reminder (optional)"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)'}
          style={[
            styles.input,
            {
              color: isDark ? '#FFFFFF' : '#0F172A',
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            },
          ]}
        />

        <View style={styles.inlineSection}>
          <Text style={styles.fieldLabel}>Subject</Text>
          <View style={styles.chipRow}>
            {subjects.map((subject) => {
              const isSelected = selectedSubjectId === subject.id;

              return (
                <Pressable
                  key={subject.id}
                  onPress={() => setSelectedSubjectId(subject.id)}
                  style={[
                    styles.subjectChip,
                    { borderColor: subject.color },
                    isSelected && { backgroundColor: subject.color },
                  ]}>
                  <Text
                    style={[
                      styles.subjectChipText,
                      { color: isSelected ? '#FFFFFF' : subject.color },
                    ]}>
                    {subject.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.inlineSection}>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((level) => {
              const isSelected = priority === level;

              return (
                <Pressable
                  key={level}
                  onPress={() => setPriority(level)}
                  style={[styles.priorityChip, isSelected && styles.priorityChipSelected]}>
                  <Text style={[styles.priorityText, isSelected && styles.priorityTextSelected]}>
                    {level[0].toUpperCase() + level.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            (!selectedSubjectId || !title.trim() || isSaving) && styles.buttonDisabled,
          ]}
          disabled={!selectedSubjectId || !title.trim() || isSaving}
          onPress={onCreateTodo}>
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving to-do...' : 'Create to-do'}
          </Text>
        </Pressable>
      </View>

      {subjectsLoading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.emptyText}>Loading subjects...</Text>
        </View>
      ) : null}

      {!subjectsLoading && subjects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Create a subject first</Text>
          <Text style={styles.emptyText}>
            To-dos in Planora belong to a subject, so start in the Subjects tab and add one class.
          </Text>
        </View>
      ) : null}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Your tasks</Text>

        {todosLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.emptyText}>Loading tasks...</Text>
          </View>
        ) : null}

        {!todosLoading && todos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>
              Add your first assignment here and we’ll use it as the base for schedule and study flows.
            </Text>
          </View>
        ) : null}

        {todos.map((todo) => {
          const isCompleted = Boolean(todo.completedAt);

          return (
            <View key={todo.id} style={[styles.todoCard, isCompleted && styles.todoCardCompleted]}>
              <View style={styles.todoMain}>
                <Pressable
                  style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
                  onPress={async () => {
                    try {
                      await toggleTodo(todo.id, isCompleted);
                    } catch (error) {
                      Alert.alert(
                        'Could not update to-do',
                        error instanceof Error ? error.message : 'Unknown error'
                      );
                    }
                  }}>
                  <Text style={styles.checkboxLabel}>{isCompleted ? '✓' : ''}</Text>
                </Pressable>

                <View style={styles.todoText}>
                  <Text style={[styles.todoTitle, isCompleted && styles.todoTitleCompleted]}>
                    {todo.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.subjectDot, { backgroundColor: todo.subjectColor }]} />
                    <Text style={styles.metaText}>{todo.subjectName}</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{todo.priority}</Text>
                    {todo.dueAt ? (
                      <>
                        <Text style={styles.metaText}>•</Text>
                        <Text style={styles.metaText}>{todo.dueAt}</Text>
                      </>
                    ) : null}
                  </View>
                  {todo.notes ? <Text style={styles.notesText}>{todo.notes}</Text> : null}
                </View>
              </View>

              <Pressable onPress={() => onDeleteTodo(todo.id, todo.title)}>
                <Text style={styles.deleteLabel}>Delete</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2563EB',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
  },
  formCard: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  inlineSection: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.75,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'transparent',
  },
  subjectChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priorityChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  priorityChipSelected: {
    backgroundColor: '#0F172A',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  listSection: {
    gap: 12,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 20,
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  todoCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  todoCardCompleted: {
    opacity: 0.65,
  },
  todoMain: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#2563EB',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  todoText: {
    flex: 1,
    gap: 6,
    backgroundColor: 'transparent',
  },
  todoTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    opacity: 0.7,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.78,
  },
  deleteLabel: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
});
