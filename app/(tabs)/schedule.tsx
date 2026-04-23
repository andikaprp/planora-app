import { useEffect, useMemo, useState } from 'react';
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
import { useTimetable } from '@/src/features/schedule/useTimetable';
import { useSubjects } from '@/src/features/subjects/useSubjects';

const WEEK_DAYS = [
  { label: 'Mon', value: 1, title: 'Monday' },
  { label: 'Tue', value: 2, title: 'Tuesday' },
  { label: 'Wed', value: 3, title: 'Wednesday' },
  { label: 'Thu', value: 4, title: 'Thursday' },
  { label: 'Fri', value: 5, title: 'Friday' },
  { label: 'Sat', value: 6, title: 'Saturday' },
  { label: 'Sun', value: 0, title: 'Sunday' },
];

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { slots, isLoading: slotsLoading, addSlot, removeSlot } = useTimetable();

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  const groupedSlots = useMemo(() => {
    return WEEK_DAYS.map((day) => ({
      ...day,
      slots: slots.filter((slot) => slot.dayOfWeek === day.value),
    }));
  }, [slots]);

  async function onCreateSlot() {
    if (!selectedSubjectId || !startTime.trim() || !endTime.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addSlot({
        dayOfWeek,
        endTime,
        location,
        notes,
        startTime,
        subjectId: selectedSubjectId,
      });

      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
    } catch (error) {
      Alert.alert('Could not save slot', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  function onDeleteSlot(id: string, subjectName: string, dayTitle: string) {
    Alert.alert('Delete slot?', `Remove ${subjectName} from ${dayTitle}'s timetable?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeSlot(id);
          } catch (error) {
            Alert.alert(
              'Could not delete slot',
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
        <Text style={styles.eyebrow}>Schedule</Text>
        <Text style={styles.title}>Build your weekly timetable</Text>
        <Text style={styles.subtitle}>
          Add recurring study sessions or class blocks for each subject so the week feels planned.
        </Text>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
        ]}>
        <Text style={styles.sectionTitle}>Add a time block</Text>

        <View style={styles.inlineSection}>
          <Text style={styles.fieldLabel}>Day</Text>
          <View style={styles.chipRow}>
            {WEEK_DAYS.map((day) => {
              const isSelected = day.value === dayOfWeek;

              return (
                <Pressable
                  key={day.label}
                  onPress={() => setDayOfWeek(day.value)}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}>
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.timeRow}>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            placeholder="Start (09:00)"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)'}
            style={[
              styles.input,
              styles.halfInput,
              {
                color: isDark ? '#FFFFFF' : '#0F172A',
                borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
              },
            ]}
          />
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            placeholder="End (10:30)"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)'}
            style={[
              styles.input,
              styles.halfInput,
              {
                color: isDark ? '#FFFFFF' : '#0F172A',
                borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
              },
            ]}
          />
        </View>

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

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location (optional)"
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

        <Pressable
          style={[
            styles.primaryButton,
            (!selectedSubjectId || !startTime.trim() || !endTime.trim() || isSaving) &&
              styles.buttonDisabled,
          ]}
          disabled={!selectedSubjectId || !startTime.trim() || !endTime.trim() || isSaving}
          onPress={onCreateSlot}>
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving block...' : 'Create time block'}
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
            Schedule blocks belong to a subject, so add one in the Subjects tab first.
          </Text>
        </View>
      ) : null}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Weekly view</Text>

        {slotsLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.emptyText}>Loading timetable...</Text>
          </View>
        ) : null}

        {!slotsLoading &&
          groupedSlots.map((day) => (
            <View key={day.title} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day.title}</Text>
              {day.slots.length === 0 ? (
                <View style={styles.dayEmpty}>
                  <Text style={styles.dayEmptyText}>No blocks planned yet.</Text>
                </View>
              ) : (
                day.slots.map((slot) => (
                  <View key={slot.id} style={styles.slotCard}>
                    <View style={styles.slotMain}>
                      <View style={[styles.slotBadge, { backgroundColor: slot.subjectColor }]} />
                      <View style={styles.slotText}>
                        <Text style={styles.slotTitle}>{slot.subjectName}</Text>
                        <Text style={styles.slotMeta}>
                          {slot.startTime} - {slot.endTime}
                          {slot.location ? ` • ${slot.location}` : ''}
                        </Text>
                        {slot.notes ? <Text style={styles.slotNotes}>{slot.notes}</Text> : null}
                      </View>
                    </View>
                    <Pressable onPress={() => onDeleteSlot(slot.id, slot.subjectName, day.title)}>
                      <Text style={styles.deleteLabel}>Delete</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          ))}
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
  dayChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  dayChipSelected: {
    backgroundColor: '#0F172A',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  halfInput: {
    flex: 1,
  },
  notesInput: {
    minHeight: 92,
    textAlignVertical: 'top',
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
    gap: 14,
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
  daySection: {
    gap: 10,
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  dayEmpty: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  dayEmptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  slotCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  slotMain: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  slotBadge: {
    width: 12,
    borderRadius: 999,
  },
  slotText: {
    flex: 1,
    gap: 4,
    backgroundColor: 'transparent',
  },
  slotTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  slotMeta: {
    fontSize: 13,
    opacity: 0.72,
  },
  slotNotes: {
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
