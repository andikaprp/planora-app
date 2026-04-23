import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/src/lib/supabase';
import { AuthTextInput } from '@/src/features/auth/AuthTextInput';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function LoginScreen() {
  const { isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email || !password) return;
    if (!supabase) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to continue.',
      );
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to continue.</Text>

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Auth is not ready yet</Text>
          <Text style={styles.noticeText}>
            Fill in the Supabase values from `.env.example` before trying to sign in.
          </Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <AuthTextInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthTextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={[
            styles.primaryButton,
            (loading || !email || !password || !isSupabaseConfigured) && styles.primaryDisabled,
          ]}
          disabled={loading || !email || !password || !isSupabaseConfigured}
          onPress={onLogin}>
          <Text style={styles.primaryButtonText}>{loading ? 'Logging in…' : 'Log in'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.link}>Don’t have an account? Create one</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  form: {
    marginTop: 16,
    gap: 12,
  },
  noticeCard: {
    marginTop: 8,
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
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
});
