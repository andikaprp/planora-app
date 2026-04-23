import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { planoraFontFamily } from '@/src/lib/planora-fonts';

export const planoraColors = {
  aurora50: '#F2FAF6',
  aurora100: '#E5F4ED',
  aurora200: '#BFE4D3',
  aurora500: '#217957',
  aurora600: '#1B6447',
  void0: '#FFFFFF',
  void50: '#FAFAFA',
  void100: '#F0F0F0',
  void200: '#E4E4E4',
  void700: '#868686',
  void800: '#6F6F6F',
  void1000: '#1E1E1E',
  tangerine400: '#FF9A40',
  danger500: '#FF0000',
};

export const planoraHeadingFont = planoraFontFamily.heading;
export const planoraBodyFont = planoraFontFamily.body;
export const planoraBodySemiFont = planoraFontFamily.bodySemi;

export function planoraDisplayName(email?: string | null) {
  if (!email) {
    return 'Andika';
  }

  const localPart = email.split('@')[0] ?? 'Andika';
  if (!localPart) {
    return 'Andika';
  }

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export function PlanoraLogoMark({
  size = 32,
  tone = 'light',
}: {
  size?: number;
  tone?: 'green' | 'light';
}) {
  const color = tone === 'light' ? planoraColors.void0 : planoraColors.aurora500;

  return (
    <View style={[styles.logoWrap, { width: size, height: size }]}>
      <Text style={[styles.logoMainStar, { color, fontSize: size * 0.68 }]}>✦</Text>
      <Text
        style={[
          styles.logoTinyStar,
          {
            color,
            fontSize: size * 0.28,
            left: size * 0.08,
            bottom: size * 0.03,
          },
        ]}>
        ✦
      </Text>
    </View>
  );
}

export function PlanoraProfilePill({
  name,
  onPress,
}: {
  name: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.profileIcon}>
        <FontAwesome name="user-o" size={11} color={planoraColors.void700} />
      </View>
      <Text style={styles.profileName}>{name}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.profilePill, pressed && { opacity: 0.88 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.profilePill}>{content}</View>;
}

export function PlanoraCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PlanoraInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={planoraColors.void700}
      style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
    />
  );
}

export function PlanoraPrimaryButton({
  label,
  onPress,
  disabled,
  compact,
  fullWidth,
  icon = 'plus',
  variant = 'solid',
  heroCta = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  icon?: React.ComponentProps<typeof FontAwesome>['name'] | null;
  variant?: 'outline' | 'soft' | 'solid';
  /** Capsule CTA on green hero (Figma: Atur flashcard) */
  heroCta?: boolean;
}) {
  const variantStyle =
    variant === 'outline'
      ? styles.primaryButtonOutline
      : variant === 'soft'
        ? styles.primaryButtonSoft
        : styles.primaryButtonSolid;
  const variantTextStyle =
    variant === 'outline'
      ? styles.primaryButtonOutlineText
      : variant === 'soft'
        ? styles.primaryButtonSoftText
        : styles.primaryButtonSolidText;
  const iconColor =
    variant === 'solid' ? planoraColors.void0 : planoraColors.aurora600;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.primaryButton,
        compact && styles.primaryButtonCompact,
        heroCta && styles.primaryButtonHeroCta,
        fullWidth && styles.primaryButtonFullWidth,
        variantStyle,
        disabled && styles.primaryButtonDisabled,
      ]}>
      <Text
        style={[
          styles.primaryButtonText,
          (compact || heroCta) && styles.primaryButtonTextCompact,
          variantTextStyle,
        ]}>
        {label}
      </Text>
      {icon ? (
        <FontAwesome
          name={icon}
          size={heroCta ? 10 : compact ? 12 : 14}
          color={iconColor}
        />
      ) : null}
    </Pressable>
  );
}

export function PlanoraFilterPill({
  label,
  active,
  onPress,
  stretch = true,
  tone = 'surface',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  stretch?: boolean;
  tone?: 'hero' | 'surface';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        stretch && styles.filterPillStretch,
        tone === 'hero' ? styles.filterPillHero : styles.filterPillSurface,
        active && (tone === 'hero' ? styles.filterPillActiveHero : styles.filterPillActiveSurface),
      ]}>
      <Text
        style={[
          styles.filterPillText,
          tone === 'hero' ? styles.filterPillTextHero : styles.filterPillTextSurface,
          active &&
            (tone === 'hero' ? styles.filterPillTextActiveHero : styles.filterPillTextActiveSurface),
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PlanoraSectionTitle({
  title,
  actionLabel,
  onActionPress,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress} style={styles.sectionActionPill}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type SubjectChip = {
  id: string;
  name: string;
};

type DashboardHeroProps = {
  actionLabel: string;
  actionSecondaryLabel?: string;
  allChipLabel?: string;
  cardCounter: string;
  cardWord: string;
  selectedSubjectId: string | null;
  showAllChip?: boolean;
  subjectLabel: string;
  subjects: SubjectChip[];
  title: string;
  userName: string;
  onActionPress?: () => void;
  onCardPress?: () => void;
  onSelectSubject?: (subjectId: string | null) => void;
  onProfilePress?: () => void;
};

export function PlanoraDashboardHero({
  actionLabel,
  actionSecondaryLabel,
  allChipLabel = 'Semua pelajaran',
  cardCounter,
  cardWord,
  selectedSubjectId,
  showAllChip = true,
  subjectLabel,
  subjects,
  title,
  userName,
  onActionPress,
  onCardPress,
  onSelectSubject,
  onProfilePress,
}: DashboardHeroProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBlurLarge} />
      <View style={styles.heroBlurSmall} />
      <View style={styles.heroBlurDark} />

      <View style={styles.heroHeader}>
        <PlanoraLogoMark tone="light" />
        <PlanoraProfilePill name={userName} onPress={onProfilePress} />
      </View>

      <Text style={styles.heroTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heroChipRow}>
        {showAllChip ? (
          <PlanoraFilterPill
            active={selectedSubjectId === null}
            label={allChipLabel}
            onPress={() => onSelectSubject?.(null)}
            stretch={false}
            tone="hero"
          />
        ) : null}

        {subjects.map((subject) => (
          <PlanoraFilterPill
            key={subject.id}
            active={selectedSubjectId === subject.id}
            label={subject.name}
            onPress={() => onSelectSubject?.(subject.id)}
            stretch={false}
            tone="hero"
          />
        ))}
      </ScrollView>

      <View style={styles.heroDeckWrap}>
        <View style={styles.heroDeckBack} />
        <View style={styles.heroDeckMiddle} />

        <Pressable disabled={!onCardPress} onPress={onCardPress} style={styles.heroDeckShell}>
          <View style={styles.heroDeckInner}>
            <PlanoraLogoMark size={16} tone="green" />
            <Text style={styles.heroDeckCounter}>{cardCounter}</Text>

            <View style={styles.heroDeckCenter}>
              <Text style={styles.heroDeckWord}>{cardWord}</Text>
            </View>

            <View style={styles.heroDeckFooter}>
              <Text style={styles.heroDeckSubject}>{subjectLabel}</Text>
              <Text style={styles.heroDeckAction}>{actionSecondaryLabel ?? 'Buka kartu'}</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <PlanoraPrimaryButton heroCta label={actionLabel} onPress={onActionPress} />
    </View>
  );
}

export function PlanoraTodoCard({
  emoji,
  title,
  description,
  meta,
  metaColor,
  borderColor,
  checked,
  onPress,
  onTogglePress,
  trailing,
}: {
  emoji: string;
  title: string;
  description?: string | null;
  meta: string | ReactNode;
  metaColor?: string;
  borderColor?: string;
  checked?: boolean;
  onPress?: () => void;
  onTogglePress?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <PlanoraCard
      style={[
        styles.todoCard,
        borderColor
          ? {
              borderColor,
              borderWidth: 2,
            }
          : styles.todoCardDefaultBorder,
      ]}>
      <Text style={styles.todoCardEmoji}>{emoji}</Text>

      <Pressable disabled={!onPress} onPress={onPress} style={styles.todoCardBody}>
        <Text style={styles.todoCardTitle}>{title}</Text>
        {description ? <Text style={styles.todoCardDescription}>{description}</Text> : null}
        {typeof meta === 'string' ? (
          <Text style={[styles.todoCardMeta, metaColor ? { color: metaColor } : null]}>{meta}</Text>
        ) : (
          meta
        )}
      </Pressable>

      <View style={styles.todoCardTrailing}>
        {trailing}
        <Pressable onPress={onTogglePress} style={styles.todoCardCheck}>
          <FontAwesome
            name={checked ? 'check-square-o' : 'square-o'}
            size={20}
            color={checked ? planoraColors.aurora500 : planoraColors.void800}
          />
        </Pressable>
      </View>
    </PlanoraCard>
  );
}

export function PlanoraAuthScaffold({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <ScrollView style={styles.authScroll} contentContainerStyle={styles.authContent}>
      <View style={styles.authGlowPrimary} />
      <View style={styles.authGlowSecondary} />

      <View style={styles.authBrand}>
        <PlanoraLogoMark tone="green" />
        <Text style={styles.authBrandText}>Planora</Text>
      </View>

      <Text style={styles.authTitle}>{title}</Text>
      <Text style={styles.authSubtitle}>{subtitle}</Text>

      <PlanoraCard style={styles.authCard}>{children}</PlanoraCard>
      {footer}
    </ScrollView>
  );
}

export function PlanoraTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabMeta: Record<
    string,
    { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string }
  > = {
    todo: { icon: 'check-square', label: 'To-do' },
    schedule: { icon: 'calendar', label: 'Jadwal' },
    subjects: { icon: 'book', label: 'Pelajaran' },
  };

  const tabOrder: string[] = ['todo', 'schedule', 'subjects'];
  const visibleRoutes = state.routes
    .filter((route: any) => tabMeta[route.name])
    .sort(
      (a: any, b: any) => tabOrder.indexOf(a.name) - tabOrder.indexOf(b.name)
    );

  function navigateTo(routeName: string) {
    switch (routeName) {
      case 'todo':
        router.navigate('/(tabs)/todo');
        break;
      case 'schedule':
        router.navigate('/(tabs)/schedule');
        break;
      case 'subjects':
        router.navigate('/(tabs)/subjects');
        break;
      default:
        break;
    }
  }

  return (
    <View
      style={[
        styles.tabBarWrap,
        { paddingBottom: Math.max(insets.bottom, 6), paddingTop: 2 },
      ]}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route: any) => {
          const descriptor = descriptors[route.key];
          const index = state.routes.findIndex((candidate: any) => candidate.key === route.key);
          const isFocused = state.index === index;
          const meta = tabMeta[route.name];
          const iconSize = isFocused ? 30 : 22;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigateTo(route.name);
                }
              }}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
                route.name === 'todo' && isFocused && styles.tabItemToDoIcon,
              ]}>
              <View style={styles.tabIconWrap}>
                <FontAwesome
                  name={meta.icon}
                  size={iconSize}
                  color={isFocused ? planoraColors.aurora500 : planoraColors.void800}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {descriptor.options.title ?? meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoMainStar: {
    fontWeight: '700',
  },
  logoTinyStar: {
    position: 'absolute',
    opacity: 0.88,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: planoraColors.void0,
    shadowColor: planoraColors.void0,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  profileName: {
    color: planoraColors.void1000,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodySemiFont,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: planoraColors.void0,
    shadowColor: '#0C5B45',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 30, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    lineHeight: 20,
    color: planoraColors.void1000,
    backgroundColor: 'rgba(0,0,0,0.03)',
    fontFamily: planoraBodyFont,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 84,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  primaryButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  primaryButtonHeroCta: {
    alignSelf: 'center',
    minHeight: 40,
    paddingVertical: 8,
    paddingLeft: 20,
    paddingRight: 16,
    gap: 4,
  },
  primaryButtonFullWidth: {
    alignSelf: 'stretch',
  },
  primaryButtonSolid: {
    backgroundColor: planoraColors.aurora500,
  },
  primaryButtonSoft: {
    backgroundColor: planoraColors.aurora200,
  },
  primaryButtonOutline: {
    borderWidth: 1,
    borderColor: planoraColors.aurora500,
    backgroundColor: planoraColors.void0,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: planoraBodySemiFont,
  },
  primaryButtonTextCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  primaryButtonSolidText: {
    color: planoraColors.void0,
  },
  primaryButtonSoftText: {
    color: planoraColors.aurora600,
  },
  primaryButtonOutlineText: {
    color: planoraColors.aurora600,
  },
  filterPill: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterPillStretch: {
    flex: 1,
  },
  filterPillHero: {
    borderColor: planoraColors.void0,
    backgroundColor: 'transparent',
  },
  filterPillSurface: {
    borderColor: planoraColors.void200,
    backgroundColor: planoraColors.void0,
  },
  filterPillActiveHero: {
    backgroundColor: planoraColors.aurora50,
    borderColor: planoraColors.aurora500,
  },
  filterPillActiveSurface: {
    backgroundColor: planoraColors.aurora50,
    borderColor: planoraColors.aurora500,
  },
  filterPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodySemiFont,
  },
  filterPillTextHero: {
    color: planoraColors.void0,
  },
  filterPillTextSurface: {
    color: planoraColors.void700,
  },
  filterPillTextActiveHero: {
    color: planoraColors.aurora500,
  },
  filterPillTextActiveSurface: {
    color: planoraColors.aurora500,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
  },
  sectionActionPill: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: planoraColors.aurora200,
  },
  sectionActionText: {
    color: planoraColors.aurora600,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodySemiFont,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 20,
    backgroundColor: planoraColors.aurora600,
  },
  /** Layered conic + blur approximates Figma "Aurora Green" background */
  heroBlurLarge: {
    position: 'absolute',
    width: 400,
    height: 500,
    borderRadius: 24,
    top: '50%',
    left: '50%',
    marginTop: -420,
    marginLeft: -200,
    transform: [{ translateY: 6 }],
    backgroundColor: 'rgba(229, 244, 237, 0.32)',
  },
  heroBlurSmall: {
    position: 'absolute',
    width: 220,
    height: 280,
    borderRadius: 20,
    top: 8,
    right: -20,
    backgroundColor: 'rgba(110, 180, 148, 0.22)',
  },
  heroBlurDark: {
    position: 'absolute',
    width: 280,
    height: 260,
    borderRadius: 24,
    bottom: -80,
    left: '50%',
    marginLeft: -140,
    backgroundColor: 'rgba(27, 100, 71, 0.35)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  heroTitle: {
    marginTop: 28,
    color: planoraColors.void0,
    fontFamily: planoraHeadingFont,
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  heroChipRow: {
    gap: 8,
    paddingTop: 16,
    paddingBottom: 18,
    paddingRight: 12,
  },
  heroDeckWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroDeckBack: {
    position: 'absolute',
    top: 4,
    width: 313,
    height: 188,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  heroDeckMiddle: {
    position: 'absolute',
    top: 10,
    width: 329,
    height: 188,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  heroDeckShell: {
    width: '100%',
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: planoraColors.void0,
  },
  heroDeckInner: {
    minHeight: 188,
    margin: 8,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: planoraColors.aurora600,
    backgroundColor: planoraColors.void0,
  },
  heroDeckCounter: {
    position: 'absolute',
    top: 24,
    right: 20,
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodyFont,
  },
  heroDeckCenter: {
    flex: 1,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroDeckWord: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  heroDeckFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  heroDeckSubject: {
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodyFont,
  },
  heroDeckAction: {
    color: planoraColors.aurora500,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodySemiFont,
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 16,
  },
  todoCardDefaultBorder: {
    borderWidth: 1,
    borderColor: planoraColors.void200,
  },
  todoCardEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  todoCardBody: {
    flex: 1,
    gap: 4,
    backgroundColor: 'transparent',
  },
  todoCardTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 16,
    lineHeight: 22,
  },
  todoCardDescription: {
    color: planoraColors.void1000,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodyFont,
  },
  todoCardMeta: {
    color: planoraColors.void700,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: planoraBodyFont,
  },
  todoCardTrailing: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: 'transparent',
  },
  todoCardCheck: {
    paddingTop: 4,
  },
  authScroll: {
    flex: 1,
    backgroundColor: planoraColors.void0,
  },
  authContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'center',
    gap: 18,
  },
  authGlowPrimary: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(229, 244, 237, 0.85)',
    top: 60,
    left: -60,
  },
  authGlowSecondary: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(191, 228, 211, 0.5)',
    right: -70,
    bottom: 100,
  },
  authBrand: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: planoraColors.void0,
  },
  authBrandText: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 18,
    lineHeight: 24,
  },
  authTitle: {
    color: planoraColors.void1000,
    fontFamily: planoraHeadingFont,
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
  },
  authSubtitle: {
    color: planoraColors.void800,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: planoraBodyFont,
  },
  authCard: {
    gap: 14,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  tabBarWrap: {
    backgroundColor: planoraColors.void0,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 24,
    gap: 8,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: planoraColors.aurora500,
  },
  /** To-do tab uses a larger mark in Figma */
  tabItemToDoIcon: {
    paddingTop: 8,
  },
  tabIconWrap: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: planoraColors.void800,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: planoraBodyFont,
  },
  tabLabelActive: {
    color: planoraColors.aurora500,
    fontFamily: planoraBodySemiFont,
  },
});
