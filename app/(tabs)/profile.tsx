import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function ProfileScreen() {
  const { isSupabaseConfigured, session } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (!supabase) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to continue.',
      );
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/onboarding');
    } catch (e) {
      Alert.alert('Logout failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        {session?.user.email ?? 'Connect Supabase auth to display the active user here.'}
      </Text>
      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Supabase setup needed</Text>
          <Text style={styles.noticeText}>
            Add your public URL and anon key to enable account actions.
          </Text>
        </View>
      ) : null}
      <Pressable
        style={[styles.button, (!isSupabaseConfigured || loading) && styles.disabled]}
        disabled={!isSupabaseConfigured || loading}
        onPress={onLogout}>
        <Text style={styles.buttonText}>{loading ? 'Logging out…' : 'Log out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
  },
  noticeCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.1)',
    gap: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: '700' },
});
