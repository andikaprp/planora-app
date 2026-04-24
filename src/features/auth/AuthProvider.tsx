import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import {
  createPreviewSession,
  isAuthPreviewEnabled,
  previewSessionStorageKey,
} from '@/src/lib/auth-bypass';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/src/lib/storage';

const onboardingStorageKey = 'planora.onboarding.complete';

type AuthContextValue = {
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  isAuthPreview: boolean;
  isReady: boolean;
  isSupabaseConfigured: boolean;
  session: Session | null;
  completeOnboarding: () => Promise<void>;
  enterPreview: () => Promise<void>;
  exitPreview: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [previewSignedIn, setPreviewSignedIn] = useState(false);

  const session: Session | null = supabaseSession
    ? supabaseSession
    : isAuthPreviewEnabled && previewSignedIn
      ? createPreviewSession()
      : null;

  const isAuthPreview = Boolean(isAuthPreviewEnabled && previewSignedIn && !supabaseSession);
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const [onboardingValue, storedPreview] = await Promise.all([
        getStorageItem(onboardingStorageKey),
        isAuthPreviewEnabled
          ? getStorageItem(previewSessionStorageKey)
          : Promise.resolve(null),
      ]);

      if (!isMounted) {
        return;
      }

      setHasCompletedOnboarding(onboardingValue === 'true');
      if (isAuthPreviewEnabled && storedPreview === 'true') {
        setPreviewSignedIn(true);
      }

      if (!supabase) {
        setIsReady(true);
        return;
      }

      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSupabaseSession(initialSession);
      setIsReady(true);
    }

    bootstrap();

    const authSubscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSupabaseSession(nextSession);
    });

    return () => {
      isMounted = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function completeOnboarding() {
    await setStorageItem(onboardingStorageKey, 'true');
    setHasCompletedOnboarding(true);
  }

  async function enterPreview() {
    if (!isAuthPreviewEnabled) {
      return;
    }
    await setStorageItem(previewSessionStorageKey, 'true');
    setPreviewSignedIn(true);
  }

  async function exitPreview() {
    if (!isAuthPreviewEnabled) {
      return;
    }
    await removeStorageItem(previewSessionStorageKey);
    setPreviewSignedIn(false);
  }

  return (
    <AuthContext.Provider
      value={{
        hasCompletedOnboarding,
        isAuthenticated,
        isAuthPreview,
        isReady,
        isSupabaseConfigured,
        session,
        completeOnboarding,
        enterPreview,
        exitPreview,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
