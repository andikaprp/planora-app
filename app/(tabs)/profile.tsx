import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/src/lib/supabase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);

  async function onLogout() {
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
      <Pressable style={[styles.button, loading && styles.disabled]} disabled={loading} onPress={onLogout}>
        <Text style={styles.buttonText}>{loading ? 'Logging out…' : 'Log out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '800' },
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

