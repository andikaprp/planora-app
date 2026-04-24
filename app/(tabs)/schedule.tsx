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
  planoraColors,
  planoraDisplayName,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useFlashcards } from '@/src/features/flashcards/useFlashcards';
import { useTimetable } from '@/src/features/schedule/useTimetable';
import { useSubjects } from '@/src/features/subjects/useSubjects';
import { confirmDestructive } from '@/src/lib/confirm';

const WEEK_DAYS = [
  { label: 'Min', title: 'Minggu', value: 0 },
  { label: 'Sen', title: 'Senin', value: 1 },
  { label: 'Sel', title: 'Selasa', value: 2 },
  { label: 'Rab', title: 'Rabu', value: 3 },
  { label: 'Kam', title: 'Kamis', value: 4 },
  { label: 'Jum', title: 'Jumat', value: 5 },
  { label: 'Sab', title: 'Sabtu', value: 6 },
];

export default function ScheduleScreen() {
  const { session } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { cards, decks } = useFlashcards();
  const { slots, isLoading: slotsLoading, addSlot, removeSlot } = useTimetable();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [composerSubjectId, setComposerSubjectId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
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

  const visibleSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (slot.dayOfWeek !== selectedDay) {
        return false;
      }

      if (selectedSubjectId && slot.subjectId !== selectedSubjectId) {
        return false;
      }

      return true;
    });
  }, [selectedDay, selectedSubjectId, slots]);

  async function onCreateSlot() {
    if (!composerSubjectId || !startTime.trim() || !endTime.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addSlot({
        dayOfWeek: selectedDay,
        endTime,
        location,
        notes,
        startTime,
        subjectId: composerSubjectId,
      });
      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
      setIsComposerOpen(false);
    } catch (error) {
      Alert.alert('Could not save schedule', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteSlot(id: string, title: string) {
    const confirmed = await confirmDestructive({
      title: 'Hapus jadwal?',
      message: `Jadwal "${title}" akan dihapus dari hari ini.`,
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeSlot(id);
    } catch (error) {
      Alert.alert('Could not delete schedule', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PlanoraDashboardHero
        actionLabel="Atur flashcard"
        actionSecondaryLabel="Buka kartu"
        cardCounter={heroDeck ? `1/${Math.max(heroDeck.cardCount, 1)}` : '0/0'}
        cardWord={heroCard?.front ?? 'Jadwal belajar tersusun rapi.'}
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
          title="Jadwal"
          actionLabel={isComposerOpen ? 'Tutup' : 'Ubah'}
          onActionPress={() => setIsComposerOpen((value) => !value)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayRow}>
          {WEEK_DAYS.map((day) => (
            <PlanoraFilterPill
              key={day.value}
              active={selectedDay === day.value}
              label={`${day.label} ${slots.filter((slot) => slot.dayOfWeek === day.value).length}`}
              onPress={() => setSelectedDay(day.value)}
              stretch={false}
            />
          ))}
        </ScrollView>

        {subjectsLoading || slotsLoading ? (
          <PlanoraCard style={styles.loadingCard}>
            <ActivityIndicator size="small" color={planoraColors.aurora500} />
            <Text style={styles.loadingText}>Loading jadwal...</Text>
          </PlanoraCard>
        ) : null}

        {!subjectsLoading && subjects.length === 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Bikin pelajaran dulu</Text>
            <Text style={styles.emptyText}>
              Jadwal perlu pelajaran sebagai anchor, jadi mulai dari tab Pelajaran dulu.
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
            <Text style={styles.formTitle}>Tambah jadwal</Text>
            <Text style={styles.formText}>
              Pakai komposer ini untuk menaruh sesi belajar ke hari yang sedang aktif.
            </Text>

            <Text style={styles.fieldLabel}>Pelajaran</Text>
            <View style={styles.choiceRow}>
              {subjects.map((subject) => (
                <PlanoraFilterPill
                  key={subject.id}
                  active={composerSubjectId === subject.id}
                  label={subject.name}
                  onPress={() => setComposerSubjectId(subject.id)}
                  stretch={false}
                />
              ))}
            </View>

            <View style={styles.timeRow}>
              <PlanoraInput
                placeholder="Jam mulai"
                value={startTime}
                onChangeText={setStartTime}
                style={styles.timeInput}
              />
              <PlanoraInput
                placeholder="Jam selesai"
                value={endTime}
                onChangeText={setEndTime}
                style={styles.timeInput}
              />
            </View>

            <PlanoraInput
              placeholder="Lokasi / guru"
              value={location}
              onChangeText={setLocation}
            />
            <PlanoraInput
              multiline
              placeholder="Catatan tambahan"
              value={notes}
              onChangeText={setNotes}
            />
          </PlanoraCard>
        ) : null}

        {!slotsLoading && visibleSlots.length === 0 && subjects.length > 0 ? (
          <PlanoraCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Belum ada jadwal {WEEK_DAYS.find((day) => day.value === selectedDay)?.title}
            </Text>
            <Text style={styles.emptyText}>
              Tambahkan satu sesi belajar untuk mengisi hari ini.
            </Text>
          </PlanoraCard>
        ) : null}

        {visibleSlots.map((slot) => (
          <PlanoraCard key={slot.id} style={styles.slotCard}>
            <View style={styles.slotTimeBlock}>
              <Text style={styles.slotTime}>{slot.startTime}</Text>
              <Text style={styles.slotTimeDivider}>-</Text>
              <Text style={styles.slotTime}>{slot.endTime}</Text>
            </View>

            <View style={styles.slotBody}>
              <Text style={styles.slotTitle}>{slot.subjectName}</Text>
              <Text style={styles.slotMeta}>
                {slot.location?.trim() ? slot.location : 'Sesi belajar Planora'}
              </Text>
              {slot.notes ? <Text style={styles.slotNotes}>{slot.notes}</Text> : null}
            </View>

            <Text onPress={() => onDeleteSlot(slot.id, slot.subjectName)} style={styles.deleteText}>
              Hapus
            </Text>
          </PlanoraCard>
        ))}

        {subjects.length > 0 ? (
          <PlanoraPrimaryButton
            fullWidth
            label={isComposerOpen ? (isSaving ? 'Menyimpan...' : 'Simpan jadwal') : 'Tambah jadwal'}
            onPress={isComposerOpen ? onCreateSlot : () => setIsComposerOpen(true)}
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
  dayRow: {
    gap: 8,
    paddingRight: 12,
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
    fontWeight: '600',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  slotTimeBlock: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: planoraColors.aurora50,
    alignItems: 'center',
    gap: 2,
  },
  slotTime: {
    color: planoraColors.aurora600,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  slotTimeDivider: {
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
  },
  slotBody: {
    flex: 1,
    gap: 4,
  },
  slotTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  slotMeta: {
    color: planoraColors.aurora600,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  slotNotes: {
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
});
