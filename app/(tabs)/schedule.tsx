import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <Text style={styles.subtitle}>Weekly timetable (Figma: schedule)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.7 },
});

