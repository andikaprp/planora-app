import { useState } from 'react';
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

const SUBJECT_COLORS = ['#2563EB', '#F97316', '#0F766E', '#9333EA', '#DC2626', '#CA8A04'];

export default function SubjectsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { subjects, isLoading, addSubject, removeSubject } = useSubjects();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  async function onCreateSubject() {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await addSubject({ color: selectedColor, name });
      setName('');
    } catch (error) {
      Alert.alert('Could not save subject', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }

  function onDeleteSubject(id: string, subjectName: string) {
    Alert.alert('Delete subject?', `Remove "${subjectName}" from your workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeSubject(id);
          } catch (error) {
            Alert.alert(
              'Could not delete subject',
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
        <Text style={styles.eyebrow}>Subjects</Text>
        <Text style={styles.title}>Build your class roster</Text>
        <Text style={styles.subtitle}>
          Start with the courses you care about, then we can connect tasks, schedules, and
          flashcards to them.
        </Text>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
        ]}>
        <Text style={styles.sectionTitle}>Add a subject</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Example: Biology"
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

        <View style={styles.paletteRow}>
          {SUBJECT_COLORS.map((color) => {
            const isSelected = color === selectedColor;

            return (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorChip,
                  { backgroundColor: color },
                  isSelected && styles.colorChipSelected,
                ]}
              />
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryButton, (!name.trim() || isSaving) && styles.buttonDisabled]}
          disabled={!name.trim() || isSaving}
          onPress={onCreateSubject}>
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving subject...' : 'Create subject'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Your subjects</Text>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.emptyText}>Loading subjects...</Text>
          </View>
        ) : null}

        {!isLoading && subjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No subjects yet</Text>
            <Text style={styles.emptyText}>
              Add your first class here and we’ll use it as the anchor for the rest of the app.
            </Text>
          </View>
        ) : null}

        {subjects.map((subject, index) => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectMain}>
              <View style={[styles.subjectBadge, { backgroundColor: subject.color }]} />
              <View style={styles.subjectText}>
                <Text style={styles.subjectTitle}>{subject.name}</Text>
                <Text style={styles.subjectMeta}>Subject {index + 1}</Text>
              </View>
            </View>

            <Pressable onPress={() => onDeleteSubject(subject.id, subject.name)}>
              <Text style={styles.deleteLabel}>Delete</Text>
            </Pressable>
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
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  colorChip: {
    width: 32,
    height: 32,
    borderRadius: 999,
  },
  colorChipSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
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
  subjectCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  subjectMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
    flex: 1,
  },
  subjectBadge: {
    width: 14,
    height: 54,
    borderRadius: 999,
  },
  subjectText: {
    gap: 4,
    backgroundColor: 'transparent',
    flex: 1,
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  subjectMeta: {
    fontSize: 13,
    opacity: 0.65,
  },
  deleteLabel: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
