import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function FlashcardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>
      <Text style={styles.subtitle}>Decks → cards → study (Figma: flashcard)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { opacity: 0.7 },
});

