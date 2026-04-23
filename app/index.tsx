import { ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function IndexScreen() {
  const { hasCompletedOnboarding, isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.label}>Loading Planora...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
  },
});
