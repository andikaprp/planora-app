import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/src/lib/supabase';
import { AuthTextInput } from '@/src/features/auth/AuthTextInput';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function RegisterScreen() {
  const { isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    if (!email || password.length < 8) return;
    if (!supabase) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to continue.',
      );
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // If email confirmations are enabled, session may be null.
      if (data.session) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Check your email', 'Confirm your email, then log in.');
        router.replace('/(auth)/login');
      }
    } catch (e) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Use your email to sign up.</Text>

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Auth is not ready yet</Text>
          <Text style={styles.noticeText}>
            Fill in the Supabase values from `.env.example` before trying to create an account.
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
          placeholder="Password (min 8 chars)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={[
            styles.primaryButton,
            (loading || !email || password.length < 8 || !isSupabaseConfigured) &&
              styles.primaryDisabled,
          ]}
          disabled={loading || !email || password.length < 8 || !isSupabaseConfigured}
          onPress={onRegister}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creating…' : 'Create account'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
