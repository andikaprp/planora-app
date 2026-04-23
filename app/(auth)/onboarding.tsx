import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function OnboardingScreen() {
  const { completeOnboarding, isSupabaseConfigured } = useAuth();

  async function goToAuth(path: '/(auth)/login' | '/(auth)/register') {
    await completeOnboarding();
    router.replace(path);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planora</Text>
      <Text style={styles.subtitle}>
        Manage school activities, weekly schedules, and study sessions in one place.
      </Text>
      <View style={styles.featureList}>
        <Text style={styles.feature}>Track subjects, tasks, and due dates.</Text>
        <Text style={styles.feature}>Stay productive offline and sync later.</Text>
        <Text style={styles.feature}>Build flashcard decks for each class.</Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Supabase setup needed</Text>
          <Text style={styles.noticeText}>
            Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to start
            registering and logging in.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => goToAuth('/(auth)/login')}>
          <Text style={styles.primaryButtonText}>Log in</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => goToAuth('/(auth)/register')}>
          <Text style={styles.secondaryButtonText}>Create account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  featureList: {
    marginTop: 12,
    gap: 10,
  },
  feature: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.78,
  },
  noticeCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.08)',
    gap: 6,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
