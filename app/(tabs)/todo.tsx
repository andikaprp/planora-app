import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function TodoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-do</Text>
      <Text style={styles.subtitle}>Coming next (Figma: to-do screen)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.7 },
});

