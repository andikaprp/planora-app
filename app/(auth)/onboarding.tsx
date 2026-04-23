import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraAuthScaffold,
  PlanoraCard,
  PlanoraLogoMark,
  PlanoraPrimaryButton,
  planoraColors,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';

const slides = [
  {
    title: 'Manfaatkan flashcard\nuntuk belajar',
    subtitle: 'Bisa bantu kamu untuk inget hal-hal penting di pelajaran.',
    card: '1 + 1',
  },
  {
    title: 'Buat to-do, atur\njadwal, lihat pelajaran',
    subtitle: 'Planora bantu kamu untuk atur semua keperluan belajar.',
    card: '✓  📅  🔖',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding, isSupabaseConfigured } = useAuth();
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  async function continueToAuth() {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }

  return (
    <PlanoraAuthScaffold subtitle={slide.subtitle} title={slide.title}>
      <View style={styles.illustrationWrap}>
        <View style={styles.deckBack} />
        <View style={styles.deckMiddle} />
        <PlanoraCard style={styles.deckFront}>
          <PlanoraLogoMark size={18} tone="green" />
          <Text style={styles.deckCounter}>{index + 1}/{slides.length}</Text>
          <View style={styles.deckWordWrap}>
            <Text style={styles.deckWord}>{slide.card}</Text>
          </View>
          <Text style={styles.deckFooter}>Belajar jadi lebih terarah</Text>
        </PlanoraCard>
      </View>

      <View style={styles.dotsRow}>
        {slides.map((item, itemIndex) => (
          <Pressable
            key={item.title}
            onPress={() => setIndex(itemIndex)}
            style={[styles.dot, itemIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Supabase setup needed</Text>
          <Text style={styles.noticeText}>
            Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` before signing in.
          </Text>
        </View>
      ) : null}

      <PlanoraPrimaryButton
        fullWidth
        icon={null}
        label="Masuk / daftar"
        onPress={continueToAuth}
      />
    </PlanoraAuthScaffold>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 228,
    backgroundColor: 'transparent',
  },
  deckBack: {
    position: 'absolute',
    top: 18,
    width: 252,
    height: 148,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  deckMiddle: {
    position: 'absolute',
    top: 10,
    width: 268,
    height: 156,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  deckFront: {
    width: '100%',
    maxWidth: 284,
    minHeight: 168,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: planoraColors.aurora600,
    paddingTop: 18,
  },
  deckCounter: {
    position: 'absolute',
    top: 18,
    right: 18,
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
  },
  deckWordWrap: {
    flex: 1,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckWord: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  deckFooter: {
    color: planoraColors.void800,
    fontSize: 12,
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: planoraColors.void200,
  },
  dotActive: {
    backgroundColor: planoraColors.aurora500,
  },
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
});
