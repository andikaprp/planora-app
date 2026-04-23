import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/src/lib/supabase';
import { AuthTextInput } from '@/src/features/auth/AuthTextInput';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
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
          style={[styles.primaryButton, (loading || !email || !password) && styles.primaryDisabled]}
          disabled={loading || !email || !password}
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

