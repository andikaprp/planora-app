import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraCard,
  PlanoraDashboardHero,
  PlanoraFilterPill,
  PlanoraInput,
  PlanoraPrimaryButton,
  PlanoraSectionTitle,
  PlanoraTodoCard,
  planoraBodyFont,
  planoraBodySemiFont,
  planoraColors,
  planoraDisplayName,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useFlashcards } from '@/src/features/flashcards/useFlashcards';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { useTodos } from '@/src/features/todos/useTodos';
import { confirmDestructive } from '@/src/lib/confirm';
import type { TodoRecord } from '@/src/lib/database';

type TodoFilter = 'active' | 'completed' | 'overdue';

const PRIORITIES: TodoRecord['priority'][] = ['high', 'medium', 'low'];
const PRIORITY_LABELS: Record<TodoRecord['priority'], string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
};

export default function TodoScreen() {
  const { session } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { cards, decks } = useFlashcards();
  const { todos, isLoading: todosLoading, addTodo, removeTodo, toggleTodo } = useTodos();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [composerSubjectId, setComposerSubjectId] = useState<string | null>(null);
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('active');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [priority, setPriority] = useState<TodoRecord['priority']>('medium');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!composerSubjectId && subjects.length > 0) {
      setComposerSubjectId(subjects[0].id);
    }
  }, [composerSubjectId, subjects]);

  const displayName = planoraDisplayName(session?.user.email);
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const heroCards = selectedSubject
    ? cards.filter((card) => card.subjectId === selectedSubject.id)
    : cards;
  const heroDeck = selectedSubject
    ? decks.find((deck) => deck.subjectId === selectedSubject.id) ?? null
    : decks[0] ?? null;
  const heroCard = heroCards[0] ?? cards[0] ?? null;

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (selectedSubjectId && todo.subjectId !== selectedSubjectId) {
        return false;
      }

      if (todoFilter === 'completed') {
        return Boolean(todo.completedAt);
      }

      if (todoFilter === 'overdue') {
        return !todo.completedAt && Boolean(todo.dueAt);
      }

      return !todo.completedAt;
    });
  }, [selectedSubjectId, todoFilter, todos]);

  async function onCreateTodo() {
    if (!composerSubjectId || !title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addTodo({
        dueAt,
        notes,
        priority,
        subjectId: composerSubjectId,
        title,
      });
      setTitle('');
      setNotes('');
      setDueAt('');
      setPriority('medium');
      setIsComposerOpen(false);
    } catch (error) {
      Alert.alert('Could not save to-do', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteTodo(id: string, todoTitle: string) {
    const confirmed = await confirmDestructive({
      title: 'Hapus to-do?',
      message: `"${todoTitle}" akan dihapus dari daftar tugas kamu.`,
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeTodo(id);
    } catch (error) {
      Alert.alert('Could not delete to-do', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  function formatTodoMeta(
    subjectName: string,
    when: string,
    tone: 'danger' | 'tangerine' | 'neutral'
  ) {
    if (tone === 'danger') {
      return (
        <Text
          style={{
            fontSize: 12,
            lineHeight: 16,
            fontFamily: planoraBodyFont,
            color: planoraColors.danger500,
          }}>
          <Text style={{ fontFamily: planoraBodySemiFont }}>{subjectName}</Text>
          {` | ${when}`}
        </Text>
      );
    }
    if (tone === 'tangerine') {
      return (
        <Text
          style={{
            fontSize: 12,
            lineHeight: 16,
            fontFamily: planoraBodyFont,
            color: planoraColors.tangerine400,
          }}>
          <Text style={{ fontFamily: planoraBodySemiFont }}>{subjectName}</Text>
          {` | ${when}`}
        </Text>
      );
    }
    return (
      <Text
        style={{
          fontSize: 12,
          lineHeight: 16,
          fontFamily: planoraBodyFont,
          color: planoraColors.void700,
        }}>
        <Text style={{ color: planoraColors.void1000, fontFamily: planoraBodySemiFont }}>
          {subjectName}
        </Text>
        {` | ${when}`}
      </Text>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PlanoraDashboardHero
        actionLabel="Atur flashcard"
        actionSecondaryLabel="Buka kartu"
        cardCounter={heroDeck ? `1/${Math.max(heroDeck.cardCount, 1)}` : '0/0'}
        cardWord={heroCard?.front ?? '1 + 1'}
        selectedSubjectId={selectedSubjectId}
        subjectLabel={selectedSubject?.name ?? 'Matematika'}
        subjects={subjects}
        title={'Mau belajar apa\nhari ini?'}
        userName={displayName}
        onActionPress={() => router.push('/(tabs)/flashcards')}
        onCardPress={() => router.push('/(tabs)/flashcards')}
        onSelectSubject={setSelectedSubjectId}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      <View style={styles.sectionWrap}>
        <PlanoraSectionTitle
          title="To-Do list"
          actionLabel={isComposerOpen ? 'Tutup' : 'Ubah'}
          onActionPress={() => setIsComposerOpen((value) => !value)}
        />

        <View style={styles.filterRow}>
          <PlanoraFilterPill
            active={todoFilter === 'active'}
            label="Aktif"
            onPress={() => setTodoFilter('active')}
          />
          <PlanoraFilterPill
            active={todoFilter === 'overdue'}
            label="Terlewati"
            onPress={() => setTodoFilter('overdue')}
          />
          <PlanoraFilterPill
            active={todoFilter === 'completed'}
            label="Selesai"
            onPress={() => setTodoFilter('completed')}
          />
        </View>

        {subjectsLoading || todosLoading ? (
          <PlanoraCard style={styles.loadingCard}>
            <ActivityIndicator size="small" color={planoraColors.aurora500} />
            <Text style={styles.loadingText}>Loading to-do...</Text>
          </PlanoraCard>
        ) : null}

        {!subjectsLoading && subjects.length === 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Bikin pelajaran dulu</Text>
            <Text style={styles.emptyText}>
              To-do Planora selalu nempel ke pelajaran, jadi mulai dari tab Pelajaran dulu.
            </Text>
            <PlanoraPrimaryButton
              fullWidth
              icon={null}
              label="Buka pelajaran"
              onPress={() => router.push('/(tabs)/subjects')}
            />
          </PlanoraCard>
        ) : null}

        {isComposerOpen && subjects.length > 0 ? (
          <PlanoraCard style={styles.formCard}>
            <Text style={styles.formTitle}>Tambah to-do</Text>
            <Text style={styles.formText}>
              Isi detail tugas di bawah untuk menaruhnya ke alur kerja Planora.
            </Text>

            <PlanoraInput placeholder="Judul tugas" value={title} onChangeText={setTitle} />
            <PlanoraInput
              multiline
              placeholder="Deskripsi singkat"
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.fieldLabel}>Pelajaran</Text>
            <View style={styles.choiceRow}>
              {subjects.map((subject) => {
                const isSelected = composerSubjectId === subject.id;
                return (
                  <PlanoraFilterPill
                    key={subject.id}
                    active={isSelected}
                    label={subject.name}
                    onPress={() => setComposerSubjectId(subject.id)}
                    stretch={false}
                  />
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Prioritas</Text>
            <View style={styles.choiceRow}>
              {PRIORITIES.map((value) => (
                <PlanoraFilterPill
                  key={value}
                  active={priority === value}
                  label={PRIORITY_LABELS[value]}
                  onPress={() => setPriority(value)}
                  stretch={false}
                />
              ))}
            </View>

            <PlanoraInput
              placeholder="Tanggal / jam deadline"
              value={dueAt}
              onChangeText={setDueAt}
            />
          </PlanoraCard>
        ) : null}

        {!todosLoading && filteredTodos.length === 0 && subjects.length > 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada to-do di filter ini</Text>
            <Text style={styles.emptyText}>
              Ganti filternya atau tambahkan tugas baru untuk mulai mengisi layar ini.
            </Text>
          </PlanoraCard>
        ) : null}

        {filteredTodos.map((todo) => {
          const isCompleted = Boolean(todo.completedAt);
          const borderColor = isCompleted
            ? planoraColors.void200
            : todo.priority === 'high'
              ? planoraColors.danger500
              : todo.priority === 'medium'
                ? planoraColors.tangerine400
                : undefined;
          const emoji = isCompleted ? '✓' : todo.priority === 'high' ? '❤️' : todo.priority === 'medium' ? '😭' : '🙂';
          const when = todo.dueAt ?? 'Belum dijadwalkan';
          const metaTone: 'danger' | 'tangerine' | 'neutral' = isCompleted
            ? 'neutral'
            : todo.priority === 'high'
              ? 'danger'
              : todo.priority === 'medium'
                ? 'tangerine'
                : 'neutral';

          return (
            <PlanoraTodoCard
              key={todo.id}
              borderColor={borderColor}
              checked={isCompleted}
              description={todo.notes}
              emoji={emoji}
              meta={formatTodoMeta(todo.subjectName, when, metaTone)}
              onPress={() => toggleTodo(todo.id, isCompleted)}
              onTogglePress={() => toggleTodo(todo.id, isCompleted)}
              title={todo.title}
              trailing={
                isComposerOpen ? (
                  <Text onPress={() => onDeleteTodo(todo.id, todo.title)} style={styles.deleteText}>
                    Hapus
                  </Text>
                ) : null
              }
            />
          );
        })}

        {subjects.length > 0 ? (
          <PlanoraPrimaryButton
            fullWidth
            label={isComposerOpen ? (isSaving ? 'Menyimpan...' : 'Simpan to-do') : 'Tambah to-do'}
            onPress={isComposerOpen ? onCreateTodo : () => setIsComposerOpen(true)}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: planoraColors.void0,
  },
  content: {
    paddingBottom: 36,
  },
  sectionWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: planoraColors.aurora500,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  emptyCard: {
    gap: 10,
  },
  emptyTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  emptyText: {
    color: planoraColors.void800,
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    gap: 12,
  },
  formTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  formText: {
    color: planoraColors.void800,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldLabel: {
    color: planoraColors.void1000,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodySemiFont,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deleteText: {
    color: planoraColors.danger500,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
