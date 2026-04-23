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

export default function RegisterScreen() {
  const { isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid =
    Boolean(email) &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword &&
    isSupabaseConfigured;

  async function onRegister() {
    if (!isFormValid) {
      if (password !== confirmPassword) {
        Alert.alert('Password belum sama', 'Cek lagi password dan konfirmasi password kamu.');
      }
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace('/(tabs)/home');
        return;
      }

      Alert.alert('Cek email kamu', 'Konfirmasi email dulu, lalu masuk ke Planora.');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Daftar gagal', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlanoraAuthScaffold
      subtitle="Bikin akun baru buat mulai nyusun pelajaran, to-do, dan jadwal belajarmu."
      title="Selamat datang di Planora!">
      <AuthTextInput
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <AuthTextInput
        placeholder="Password (min. 8 karakter)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextInput
        placeholder="Konfirmasi password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Auth belum aktif</Text>
          <Text style={styles.noticeText}>
            Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` dulu.
          </Text>
        </View>
      ) : null}

      {password !== confirmPassword && confirmPassword ? (
        <Text style={styles.inlineWarning}>Konfirmasi password belum cocok.</Text>
      ) : null}

      <PlanoraPrimaryButton
        disabled={!isFormValid || loading}
        fullWidth
        icon={null}
        label={loading ? 'Mendaftarkan...' : 'Daftar'}
        onPress={onRegister}
      />

      <Pressable onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.link}>Sudah punya akun? Masuk</Text>
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
  inlineWarning: {
    color: planoraColors.danger500,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  link: {
    color: planoraColors.aurora500,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
