import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Dashboard</Text>
      <Text style={styles.title}>Welcome to Planora</Text>
      <Text style={styles.subtitle}>
        {session?.user.email
          ? `Signed in as ${session.user.email}`
          : 'Your productivity hub is ready for subjects, tasks, schedules, and flashcards.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress this pass</Text>
        <Text style={styles.cardText}>Subjects now persist locally with SQLite.</Text>
        <Text style={styles.cardText}>Supabase env wiring is scaffolded for auth setup.</Text>
        <Text style={styles.cardText}>Next strongest slice: to-do CRUD linked to subjects.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 10 },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2563EB',
  },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
  },
  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.08)',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.78,
  },
});
