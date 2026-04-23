import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraCard,
  PlanoraDashboardHero,
  PlanoraPrimaryButton,
  PlanoraSectionTitle,
  PlanoraTodoCard,
  planoraColors,
  planoraDisplayName,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useFlashcards } from '@/src/features/flashcards/useFlashcards';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { useTodos } from '@/src/features/todos/useTodos';

export default function HomeScreen() {
  const { session } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { cards, decks, isLoading: cardsLoading } = useFlashcards();
  const { todos, isLoading: todosLoading } = useTodos();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
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

  const activeTodos = useMemo(
    () =>
      todos.filter((todo) => !todo.completedAt && (!selectedSubjectId || todo.subjectId === selectedSubjectId)),
    [selectedSubjectId, todos]
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PlanoraDashboardHero
        actionLabel="Atur flashcard"
        actionSecondaryLabel="Buka kartu"
        cardCounter={heroDeck ? `1/${Math.max(heroDeck.cardCount, 1)}` : '0/0'}
        cardWord={heroCard?.front ?? '1 + 1'}
        selectedSubjectId={selectedSubjectId}
        subjectLabel={selectedSubject?.name ?? 'Belum ada pelajaran'}
        subjects={subjects}
        title={'Mau belajar apa\nhari ini?'}
        userName={displayName}
        onActionPress={() => router.push('/(tabs)/flashcards')}
        onCardPress={() => router.push('/(tabs)/flashcards')}
        onSelectSubject={setSelectedSubjectId}
      />

      <View style={styles.sectionWrap}>
        <PlanoraSectionTitle
          title="To-Do list"
          actionLabel="Ubah"
          onActionPress={() => router.push('/(tabs)/todo')}
        />

        {subjectsLoading || cardsLoading || todosLoading ? (
          <PlanoraCard style={styles.loadingCard}>
            <ActivityIndicator size="small" color={planoraColors.aurora500} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </PlanoraCard>
        ) : null}

        {!todosLoading && activeTodos.length === 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada to-do aktif</Text>
            <Text style={styles.emptyText}>
              Tambah tugas baru biar halaman utama ikut hidup seperti desain baru Planora.
            </Text>
            <PlanoraPrimaryButton
              fullWidth
              label="Tambah to-do"
              onPress={() => router.push('/(tabs)/todo')}
            />
          </PlanoraCard>
        ) : null}

        {activeTodos.slice(0, 4).map((todo) => {
          const metaColor =
            todo.priority === 'high'
              ? planoraColors.danger500
              : todo.priority === 'medium'
                ? planoraColors.tangerine400
                : planoraColors.void700;
          const borderColor =
            todo.priority === 'high'
              ? planoraColors.danger500
              : todo.priority === 'medium'
                ? planoraColors.tangerine400
                : undefined;
          const emoji = todo.priority === 'high' ? '❤️' : todo.priority === 'medium' ? '😭' : '🙂';

          return (
            <PlanoraTodoCard
              key={todo.id}
              borderColor={borderColor}
              description={todo.notes}
              emoji={emoji}
              meta={`${todo.subjectName} | ${todo.dueAt ?? 'Belum dijadwalkan'}`}
              metaColor={metaColor}
              onPress={() => router.push('/(tabs)/todo')}
              title={todo.title}
            />
          );
        })}

        {activeTodos.length > 0 ? (
          <PlanoraPrimaryButton
            fullWidth
            label="Lihat semua to-do"
            onPress={() => router.push('/(tabs)/todo')}
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
});
