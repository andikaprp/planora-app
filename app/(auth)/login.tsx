import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraAuthScaffold,
  PlanoraPrimaryButton,
  planoraColors,
} from '@/src/components/planora-ui';
import { AuthTextInput } from '@/src/features/auth/AuthTextInput';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const { isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email || !password) {
      return;
    }

    if (!supabase) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to continue.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      router.replace('/(tabs)/todo');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlanoraAuthScaffold
      subtitle="Lanjutkan belajar, atur jadwal, dan pantau to-do kamu."
      title="Masuk ke Planora">
      <AuthTextInput
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <AuthTextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Auth belum aktif</Text>
          <Text style={styles.noticeText}>
            Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` dulu.
          </Text>
        </View>
      ) : null}

      <PlanoraPrimaryButton
        disabled={loading || !email || !password || !isSupabaseConfigured}
        fullWidth
        icon={null}
        label={loading ? 'Masuk...' : 'Masuk'}
        onPress={onLogin}
      />

      <Pressable onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.link}>Belum punya akun? Daftar</Text>
      </Pressable>
    </PlanoraAuthScaffold>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    gap: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: planoraColors.aurora50,
  },
  noticeTitle: {
    color: planoraColors.aurora600,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  noticeText: {
    color: planoraColors.void800,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: planoraColors.aurora500,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
