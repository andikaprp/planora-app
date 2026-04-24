import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraCard,
  PlanoraDashboardHero,
  PlanoraFilterPill,
  PlanoraInput,
  PlanoraPrimaryButton,
  PlanoraSectionTitle,
  planoraColors,
  planoraDisplayName,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useFlashcards } from '@/src/features/flashcards/useFlashcards';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { confirmDestructive } from '@/src/lib/confirm';

const SUBJECT_COLORS = ['#217957', '#4AA57A', '#90C6AE', '#F7C66B', '#E8875A', '#A3C7F7'];
const SUBJECT_EMOJIS = ['🧪', '📐', '🧠', '🇬🇧', '📚', '🧑‍🔬'];

export default function SubjectsScreen() {
  const { session } = useAuth();
  const { subjects, isLoading, addSubject, removeSubject } = useSubjects();
  const { cards, decks } = useFlashcards();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = planoraDisplayName(session?.user.email);
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0] ?? null;
  const heroCards = selectedSubject
    ? cards.filter((card) => card.subjectId === selectedSubject.id)
    : cards;
  const heroDeck = selectedSubject
    ? decks.find((deck) => deck.subjectId === selectedSubject.id) ?? null
    : decks[0] ?? null;
  const heroCard = heroCards[0] ?? cards[0] ?? null;

  const subjectTiles = useMemo(
    () =>
      subjects.map((subject, index) => ({
        ...subject,
        emoji: SUBJECT_EMOJIS[index % SUBJECT_EMOJIS.length],
      })),
    [subjects]
  );

  async function onCreateSubject() {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addSubject({ color: selectedColor, name });
      setName('');
      setSelectedColor(
        SUBJECT_COLORS[(SUBJECT_COLORS.indexOf(selectedColor) + 1) % SUBJECT_COLORS.length]
      );
      setIsComposerOpen(false);
    } catch (error) {
      Alert.alert('Could not save subject', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteSubject(id: string, subjectName: string) {
    const confirmed = await confirmDestructive({
      title: 'Hapus pelajaran?',
      message: `Pelajaran "${subjectName}" akan dihapus dari workspace kamu.`,
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeSubject(id);
      if (selectedSubjectId === id) {
        setSelectedSubjectId(null);
      }
    } catch (error) {
      Alert.alert('Could not delete subject', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PlanoraDashboardHero
        actionLabel="Atur flashcard"
        actionSecondaryLabel="Buka kartu"
        cardCounter={heroDeck ? `1/${Math.max(heroDeck.cardCount, 1)}` : '0/0'}
        cardWord={heroCard?.front ?? 'Yuk, tambah pelajaran pertamamu!'}
        selectedSubjectId={selectedSubjectId}
        subjectLabel={selectedSubject?.name ?? 'Belum ada pelajaran'}
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
          title="Pelajaran"
          actionLabel={isComposerOpen ? 'Tutup' : 'Tambah'}
          onActionPress={() => setIsComposerOpen((value) => !value)}
        />

        {isLoading ? (
          <PlanoraCard style={styles.loadingCard}>
            <ActivityIndicator size="small" color={planoraColors.aurora500} />
            <Text style={styles.loadingText}>Loading pelajaran...</Text>
          </PlanoraCard>
        ) : null}

        {!isLoading && subjects.length === 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada pelajaran</Text>
            <Text style={styles.emptyText}>
              Tambahkan pelajaran pertama untuk menyalakan todo, jadwal, dan flashcard.
            </Text>
          </PlanoraCard>
        ) : null}

        {subjectTiles.map((subject) => (
          <PlanoraCard key={subject.id} style={styles.subjectCard}>
            <View style={[styles.subjectOrb, { backgroundColor: `${subject.color}22` }]}>
              <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
            </View>

            <View style={styles.subjectBody}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectMeta}>Siap dipakai buat belajar</Text>
            </View>

            <Text onPress={() => onDeleteSubject(subject.id, subject.name)} style={styles.deleteText}>
              Hapus
            </Text>
          </PlanoraCard>
        ))}

        {isComposerOpen ? (
          <PlanoraCard style={styles.formCard}>
            <Text style={styles.formTitle}>Tambah pelajaran</Text>
            <Text style={styles.formText}>
              Pilih warna identitas lalu isi nama pelajaran sesuai struktur belajarmu.
            </Text>

            <PlanoraInput
              placeholder="Judul pelajaran"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.colorRow}>
              {SUBJECT_COLORS.map((color) => (
                <View key={color} style={styles.colorChipWrap}>
                  <PlanoraFilterPill
                    active={selectedColor === color}
                    label=""
                    onPress={() => setSelectedColor(color)}
                    stretch={false}
                  />
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                </View>
              ))}
            </View>
          </PlanoraCard>
        ) : null}

        <PlanoraPrimaryButton
          fullWidth
          label={isComposerOpen ? (isSaving ? 'Menyimpan...' : 'Simpan pelajaran') : 'Tambah pelajaran'}
          onPress={isComposerOpen ? onCreateSubject : () => setIsComposerOpen(true)}
        />
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
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectOrb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  subjectBody: {
    flex: 1,
    gap: 4,
  },
  subjectName: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  subjectMeta: {
    color: planoraColors.void800,
    fontSize: 12,
    lineHeight: 16,
  },
  deleteText: {
    color: planoraColors.danger500,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorChipWrap: {
    position: 'relative',
  },
  colorDot: {
    position: 'absolute',
    left: 14,
    top: 9,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
