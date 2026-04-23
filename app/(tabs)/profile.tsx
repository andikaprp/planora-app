import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PlanoraCard,
  PlanoraLogoMark,
  PlanoraPrimaryButton,
  PlanoraProfilePill,
  PlanoraSectionTitle,
  planoraColors,
  planoraDisplayName,
  planoraHeadingFont,
} from '@/src/components/planora-ui';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';

type MenuRow = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { isSupabaseConfigured, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const displayName = planoraDisplayName(session?.user.email);
  const email = session?.user.email ?? 'Belum ada akun yang aktif';

  const stubAction = (title: string) =>
    Alert.alert(title, 'Flow ini belum disambungkan penuh ke backend, tapi layout baru sudah siap.');

  async function onLogout() {
    if (!supabase) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to continue.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.replace('/(auth)/onboarding');
    } catch (error) {
      Alert.alert('Logout failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const accountRows: MenuRow[] = [
    { icon: 'user-o', label: 'Pengaturan akun', onPress: () => stubAction('Pengaturan akun') },
  ];
  const preferenceRows: MenuRow[] = [
    { icon: 'globe', label: 'Bahasa', value: 'Indonesia', onPress: () => stubAction('Bahasa') },
    { icon: 'bell-o', label: 'Notifikasi pengingat', value: 'Aktif', onPress: () => stubAction('Notifikasi') },
  ];
  const feedbackRows: MenuRow[] = [
    { icon: 'lightbulb-o', label: 'Request fitur baru', onPress: () => stubAction('Request fitur baru') },
    { icon: 'commenting-o', label: 'Beri masukan aplikasi', onPress: () => stubAction('Masukan aplikasi') },
    { icon: 'bug', label: 'Laporkan masalah / bug', onPress: () => stubAction('Laporkan masalah / bug') },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroBlurOne} />
        <View style={styles.heroBlurTwo} />
        <View style={styles.heroHeader}>
          <PlanoraLogoMark tone="light" />
          <PlanoraProfilePill name={displayName} />
        </View>

        <View style={styles.heroCenter}>
          <Text style={styles.heroTitle}>Akun Planora</Text>
          <Text style={styles.heroSubtitle}>
            Sinkronkan preferensi dan jaga ruang belajar kamu tetap rapi.
          </Text>
        </View>
      </View>

      <PlanoraCard style={styles.identityCard}>
        <View style={styles.identityAvatar}>
          <FontAwesome name="user" size={36} color={planoraColors.aurora500} />
        </View>

        <View style={styles.identityBody}>
          <Text style={styles.identityName}>{displayName}</Text>
          <Text style={styles.identityEmail}>{email}</Text>
          <Text style={styles.identityStatus}>
            {isSupabaseConfigured ? 'Sinkron siap dipakai' : 'Offline mode aktif'}
          </Text>
        </View>

        <Pressable onPress={() => stubAction('Edit profil')} style={styles.editPill}>
          <Text style={styles.editPillText}>Edit</Text>
        </Pressable>
      </PlanoraCard>

      {!isSupabaseConfigured ? (
        <PlanoraCard style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Supabase setup needed</Text>
          <Text style={styles.noticeText}>
            Tambahkan public URL dan anon key kalau kamu mau pakai login penuh di halaman profil.
          </Text>
        </PlanoraCard>
      ) : null}

      <View style={styles.sectionWrap}>
        <PlanoraSectionTitle title="Pengaturan" />
        <SettingsGroup rows={accountRows} title="Akun" />
        <SettingsGroup rows={preferenceRows} title="Preferensi" />
        <SettingsGroup rows={feedbackRows} title="Masukan dan saran" />

        <PlanoraCard style={styles.logoutCard}>
          <Text style={styles.logoutTitle}>Keluar dari akun</Text>
          <Text style={styles.logoutText}>
            Kamu bisa masuk lagi kapan saja kalau autentikasi Supabase sudah aktif.
          </Text>
          <PlanoraPrimaryButton
            compact
            disabled={!isSupabaseConfigured || loading}
            fullWidth
            icon={null}
            label={loading ? 'Keluar...' : 'Keluar dari akun'}
            onPress={onLogout}
          />
        </PlanoraCard>
      </View>
    </ScrollView>
  );
}

function SettingsGroup({ rows, title }: { rows: MenuRow[]; title: string }) {
  return (
    <View style={styles.groupWrap}>
      <Text style={styles.groupTitle}>{title}</Text>
      <PlanoraCard style={styles.groupCard}>
        {rows.map((row, index) => (
          <Pressable key={row.label} onPress={row.onPress} style={styles.groupRow}>
            <View style={styles.groupRowLeft}>
              <View style={styles.groupRowIcon}>
                <FontAwesome name={row.icon} size={16} color={planoraColors.aurora500} />
              </View>
              <Text style={styles.groupRowLabel}>{row.label}</Text>
            </View>

            <View style={styles.groupRowRight}>
              {row.value ? <Text style={styles.groupRowValue}>{row.value}</Text> : null}
              <FontAwesome name="chevron-right" size={12} color={planoraColors.void700} />
            </View>
            {index < rows.length - 1 ? <View style={styles.rowDivider} /> : null}
          </Pressable>
        ))}
      </PlanoraCard>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: planoraColors.void0,
  },
  content: {
    paddingBottom: 36,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#4A906E',
  },
  heroBlurOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(229,244,237,0.5)',
    top: -70,
    right: -20,
  },
  heroBlurTwo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(191,228,211,0.28)',
    bottom: -170,
    left: -40,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCenter: {
    marginTop: 28,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  heroTitle: {
    color: planoraColors.void0,
    fontFamily: planoraHeadingFont,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: planoraColors.void0,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 24,
    marginTop: 24,
  },
  identityAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: planoraColors.aurora50,
  },
  identityBody: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  identityEmail: {
    color: planoraColors.void800,
    fontSize: 13,
    lineHeight: 18,
  },
  identityStatus: {
    color: planoraColors.aurora600,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  editPill: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: planoraColors.aurora50,
  },
  editPillText: {
    color: planoraColors.aurora600,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  noticeCard: {
    marginHorizontal: 24,
    marginTop: 16,
    gap: 4,
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
  sectionWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  groupWrap: {
    gap: 8,
  },
  groupTitle: {
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  groupCard: {
    padding: 0,
    overflow: 'hidden',
  },
  groupRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: planoraColors.aurora50,
  },
  groupRowLabel: {
    color: planoraColors.void1000,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  groupRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupRowValue: {
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
  },
  rowDivider: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: planoraColors.void200,
  },
  logoutCard: {
    gap: 10,
  },
  logoutTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  logoutText: {
    color: planoraColors.void800,
    fontSize: 14,
    lineHeight: 20,
  },
});
