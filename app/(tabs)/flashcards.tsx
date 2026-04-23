import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useFlashcards } from '@/src/features/flashcards/useFlashcards';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { useTodos } from '@/src/features/todos/useTodos';

const headingFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

type TodoFilter = 'active' | 'overdue' | 'completed';

export default function FlashcardsScreen() {
  const { session } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { todos, isLoading: todosLoading } = useTodos();
  const { cards, decks, isLoading: flashcardsLoading, addFlashcard, removeFlashcard } =
    useFlashcards();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('active');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    setIsFlipped(false);
  }, [selectedSubjectId]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const filteredCards = selectedSubjectId
    ? cards.filter((card) => card.subjectId === selectedSubjectId)
    : [];
  const featuredCard = filteredCards[0] ?? null;
  const selectedDeck = decks.find((deck) => deck.subjectId === selectedSubjectId) ?? null;

  const previewTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (todoFilter === 'completed') {
        return Boolean(todo.completedAt);
      }

      if (todoFilter === 'overdue') {
        return !todo.completedAt && Boolean(todo.dueAt);
      }

      return !todo.completedAt;
    });
  }, [todoFilter, todos]);

  const displayName = useMemo(() => {
    const email = session?.user.email;
    if (!email) {
      return 'Andika';
    }

    const localPart = email.split('@')[0] ?? 'Andika';
    if (!localPart) {
      return 'Andika';
    }

    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }, [session?.user.email]);

  async function onCreateFlashcard() {
    if (!selectedSubjectId || !front.trim() || !back.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addFlashcard({ back, front, subjectId: selectedSubjectId });
      setFront('');
      setBack('');
      setIsComposerOpen(false);
    } catch (error) {
      Alert.alert(
        'Could not save flashcard',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsSaving(false);
    }
  }

  function onDeleteFlashcard(id: string, title: string) {
    Alert.alert('Delete flashcard?', `Remove "${title}" from this deck?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFlashcard(id);
          } catch (error) {
            Alert.alert(
              'Could not delete flashcard',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />
        <View style={styles.heroGlowAccent} />

        <View style={styles.heroHeader}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoMainStar}>✦</Text>
            <Text style={styles.logoTinyStar}>✦</Text>
          </View>

          <View style={styles.profilePill}>
            <View style={styles.profileIcon}>
              <FontAwesome name="user-o" size={11} color="#8A8A8A" />
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Mau belajar apa{'\n'}hari ini?</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectChips}>
          {subjects.map((subject, index) => {
            const isSelected = selectedSubjectId === subject.id;

            return (
              <Pressable
                key={subject.id}
                onPress={() => setSelectedSubjectId(subject.id)}
                style={[
                  styles.subjectChip,
                  isSelected && styles.subjectChipSelected,
                  index === 0 && styles.subjectChipWide,
                ]}>
                <Text style={[styles.subjectChipText, isSelected && styles.subjectChipTextSelected]}>
                  {subject.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.deckWrap}>
          <View style={styles.deckShadowBack} />
          <View style={styles.deckShadowMiddle} />

          <Pressable
            style={styles.flashcardShell}
            disabled={!featuredCard}
            onPress={() => setIsFlipped((value) => !value)}>
            <View style={styles.flashcardInner}>
              <Text style={styles.flashcardLogo}>✦</Text>
              <Text style={styles.flashcardCount}>
                {featuredCard ? `1/${filteredCards.length}` : '0/0'}
              </Text>

              <View style={styles.flashcardCenter}>
                <Text style={styles.flashcardWord}>
                  {featuredCard ? (isFlipped ? featuredCard.back : featuredCard.front) : 'Belum ada kartu'}
                </Text>
              </View>

              <View style={styles.flashcardFooter}>
                <Text style={styles.flashcardSubject}>
                  {selectedSubject?.name ?? 'Pilih pelajaran'}
                </Text>
                <Text style={styles.flashcardAction}>
                  {featuredCard ? (isFlipped ? 'Lihat depan' : 'Buka kartu') : 'Tambah kartu'}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        <Pressable style={styles.manageButton} onPress={() => setIsComposerOpen((value) => !value)}>
          <Text style={styles.manageButtonText}>Atur flashcard</Text>
          <FontAwesome name="plus" size={14} color="#FFFFFF" />
        </Pressable>
      </View>

      {flashcardsLoading || subjectsLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#217957" />
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      ) : null}

      {!subjectsLoading && subjects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Create a subject first</Text>
          <Text style={styles.emptyText}>
            The flashcard design groups study decks by subject, so add one in the Subjects tab first.
          </Text>
        </View>
      ) : null}

      {isComposerOpen ? (
        <View style={styles.managerCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atur flashcard</Text>
            <Text style={styles.sectionMeta}>
              {selectedDeck ? `${selectedDeck.cardCount} kartu` : 'Buat deck pertama'}
            </Text>
          </View>

          <TextInput
            value={front}
            onChangeText={setFront}
            placeholder="Depan kartu, misalnya Natrium"
            placeholderTextColor="#8A8A8A"
            style={styles.input}
          />
          <TextInput
            value={back}
            onChangeText={setBack}
            placeholder="Belakang kartu, misalnya Na"
            placeholderTextColor="#8A8A8A"
            multiline
            style={[styles.input, styles.multilineInput]}
          />

          <Pressable
            style={[
              styles.primaryAction,
              (!selectedSubjectId || !front.trim() || !back.trim() || isSaving) &&
                styles.actionDisabled,
            ]}
            disabled={!selectedSubjectId || !front.trim() || !back.trim() || isSaving}
            onPress={onCreateFlashcard}>
            <Text style={styles.primaryActionText}>
              {isSaving ? 'Menyimpan...' : 'Tambah flashcard'}
            </Text>
          </Pressable>

          <View style={styles.cardsList}>
            {filteredCards.length === 0 ? (
              <View style={styles.inlineEmptyCard}>
                <Text style={styles.inlineEmptyTitle}>Belum ada flashcard</Text>
                <Text style={styles.inlineEmptyText}>
                  Tambahkan kartu pertama untuk {selectedSubject?.name ?? 'pelajaran ini'}.
                </Text>
              </View>
            ) : (
              filteredCards.map((card) => (
                <View key={card.id} style={styles.flashcardRow}>
                  <View style={styles.flashcardRowText}>
                    <Text style={styles.flashcardRowFront}>{card.front}</Text>
                    <Text style={styles.flashcardRowBack}>{card.back}</Text>
                  </View>
                  <Pressable onPress={() => onDeleteFlashcard(card.id, card.front)}>
                    <Text style={styles.deleteLabel}>Delete</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.todoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.todoTitle}>To-Do list</Text>
          <View style={styles.editPill}>
            <Text style={styles.editPillText}>Ubah</Text>
          </View>
        </View>

        <View style={styles.todoFilterRow}>
          <Pressable
            style={[styles.todoFilterChip, todoFilter === 'active' && styles.todoFilterChipActive]}
            onPress={() => setTodoFilter('active')}>
            <Text
              style={[styles.todoFilterText, todoFilter === 'active' && styles.todoFilterTextActive]}>
              Aktif
            </Text>
          </Pressable>
          <Pressable
            style={[styles.todoFilterChip, todoFilter === 'overdue' && styles.todoFilterChipActive]}
            onPress={() => setTodoFilter('overdue')}>
            <Text
              style={[styles.todoFilterText, todoFilter === 'overdue' && styles.todoFilterTextActive]}>
              Terlewati
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.todoFilterChip,
              todoFilter === 'completed' && styles.todoFilterChipActive,
            ]}
            onPress={() => setTodoFilter('completed')}>
            <Text
              style={[
                styles.todoFilterText,
                todoFilter === 'completed' && styles.todoFilterTextActive,
              ]}>
              Selesai
            </Text>
          </Pressable>
        </View>

        {todosLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#217957" />
            <Text style={styles.loadingText}>Loading to-dos...</Text>
          </View>
        ) : previewTodos.length === 0 ? (
          <View style={styles.inlineEmptyCard}>
            <Text style={styles.inlineEmptyTitle}>Belum ada to-do</Text>
            <Text style={styles.inlineEmptyText}>
              Screen ini mengikuti Figma, jadi preview tugas aktif juga muncul di bawah hero flashcard.
            </Text>
          </View>
        ) : (
          previewTodos.slice(0, 5).map((todo, index) => {
            const highlightStyle =
              index === 0 && todoFilter === 'active'
                ? styles.todoCardDanger
                : index === 1 && todoFilter === 'active'
                  ? styles.todoCardWarning
                  : undefined;
            const metaColor =
              index === 0 && todoFilter === 'active'
                ? '#FF0000'
                : index === 1 && todoFilter === 'active'
                  ? '#FF9A40'
                  : '#868686';

            return (
              <View key={todo.id} style={[styles.todoCard, highlightStyle]}>
                <Text style={styles.todoEmoji}>{index === 0 ? '❤️' : '😭'}</Text>

                <View style={styles.todoBody}>
                  <Text style={styles.todoCardTitle}>{todo.title}</Text>
                  {todo.notes ? <Text style={styles.todoCardNotes}>{todo.notes}</Text> : null}
                  <Text style={[styles.todoMeta, { color: metaColor }]}>
                    <Text style={styles.todoMetaSubject}>{todo.subjectName}</Text>
                    {todo.dueAt ? ` | ${todo.dueAt}` : ' | Belum dijadwalkan'}
                  </Text>
                </View>

                <View style={styles.todoCheck}>
                  <FontAwesome name="check-square-o" size={18} color="#4A4A4A" />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 36,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 26,
    overflow: 'hidden',
    backgroundColor: '#5EA584',
    shadowColor: '#0C5B45',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(229,244,237,0.62)',
    top: 150,
    left: -80,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(191,228,211,0.38)',
    top: -30,
    right: -20,
  },
  heroGlowAccent: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(27,100,71,0.2)',
    bottom: -80,
    right: -70,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  logoWrap: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoMainStar: {
    color: '#FFFFFF',
    fontSize: 22,
    opacity: 0.95,
  },
  logoTinyStar: {
    position: 'absolute',
    left: 2,
    bottom: 1,
    color: '#FFFFFF',
    fontSize: 9,
    opacity: 0.85,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  profileIcon: {
    width: 20,
    height: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  profileName: {
    color: '#1E1E1E',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 36,
    color: '#FFFFFF',
    fontFamily: headingFont,
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  subjectChips: {
    gap: 8,
    paddingTop: 22,
    paddingBottom: 24,
  },
  subjectChip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  subjectChipWide: {
    minWidth: 112,
  },
  subjectChipSelected: {
    backgroundColor: '#F2FAF6',
    borderColor: '#217957',
  },
  subjectChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  subjectChipTextSelected: {
    color: '#217957',
  },
  deckWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deckShadowBack: {
    position: 'absolute',
    width: 313,
    height: 188,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    top: 4,
    shadowColor: '#0C5B45',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  deckShadowMiddle: {
    position: 'absolute',
    width: 329,
    height: 188,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    top: 8,
    shadowColor: '#0C5B45',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  flashcardShell: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0C5B45',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  flashcardInner: {
    minHeight: 188,
    margin: 8,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B6447',
    backgroundColor: '#FFFFFF',
  },
  flashcardLogo: {
    position: 'absolute',
    top: 20,
    left: 22,
    color: '#217957',
    fontSize: 16,
  },
  flashcardCount: {
    position: 'absolute',
    top: 22,
    right: 20,
    color: '#868686',
    fontSize: 12,
  },
  flashcardCenter: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  flashcardWord: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  flashcardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  flashcardSubject: {
    color: '#868686',
    fontSize: 12,
  },
  flashcardAction: {
    color: '#217957',
    fontSize: 12,
    fontWeight: '700',
  },
  manageButton: {
    alignSelf: 'center',
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 84,
    backgroundColor: '#217957',
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F2FAF6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#217957',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F2FAF6',
    gap: 6,
  },
  emptyTitle: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6F6F6F',
    fontSize: 14,
    lineHeight: 20,
  },
  managerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0C5B45',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  sectionMeta: {
    color: '#868686',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1E1E1E',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryAction: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#217957',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionDisabled: {
    opacity: 0.55,
  },
  cardsList: {
    marginTop: 16,
    gap: 12,
  },
  inlineEmptyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    gap: 6,
  },
  inlineEmptyTitle: {
    color: '#1E1E1E',
    fontSize: 15,
    fontWeight: '700',
  },
  inlineEmptyText: {
    color: '#6F6F6F',
    fontSize: 14,
    lineHeight: 20,
  },
  flashcardRow: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flashcardRowText: {
    flex: 1,
    gap: 4,
    backgroundColor: 'transparent',
  },
  flashcardRowFront: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  flashcardRowBack: {
    color: '#6F6F6F',
    fontSize: 14,
    lineHeight: 18,
  },
  deleteLabel: {
    color: '#FF0000',
    fontSize: 13,
    fontWeight: '700',
  },
  todoSection: {
    marginTop: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  todoTitle: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  editPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 84,
    backgroundColor: '#BFE4D3',
  },
  editPillText: {
    color: '#1B6447',
    fontSize: 12,
    fontWeight: '700',
  },
  todoFilterRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  todoFilterChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
  },
  todoFilterChipActive: {
    borderColor: '#217957',
    backgroundColor: '#F2FAF6',
  },
  todoFilterText: {
    color: '#868686',
    fontSize: 12,
    fontWeight: '700',
  },
  todoFilterTextActive: {
    color: '#217957',
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
  },
  todoCardDanger: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  todoCardWarning: {
    borderWidth: 2,
    borderColor: '#FF9A40',
  },
  todoEmoji: {
    color: '#1E1E1E',
    fontSize: 20,
  },
  todoBody: {
    flex: 1,
    gap: 4,
    backgroundColor: 'transparent',
  },
  todoCardTitle: {
    color: '#1E1E1E',
    fontFamily: headingFont,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  todoCardNotes: {
    color: '#1E1E1E',
    fontSize: 12,
    lineHeight: 16,
  },
  todoMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  todoMetaSubject: {
    fontWeight: '700',
    color: '#1E1E1E',
  },
  todoCheck: {
    paddingTop: 2,
    backgroundColor: 'transparent',
  },
});
