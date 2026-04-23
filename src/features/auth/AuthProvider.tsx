import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { Session } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

const onboardingStorageKey = 'planora.onboarding.complete';

type AuthContextValue = {
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  isSupabaseConfigured: boolean;
  session: Session | null;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const onboardingValue = await SecureStore.getItemAsync(onboardingStorageKey);

      if (!isMounted) {
        return;
      }

      setHasCompletedOnboarding(onboardingValue === 'true');

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

      setSession(initialSession);
      setIsReady(true);
    }

    bootstrap();

    const authSubscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function completeOnboarding() {
    await SecureStore.setItemAsync(onboardingStorageKey, 'true');
    setHasCompletedOnboarding(true);
  }

  return (
    <AuthContext.Provider
      value={{
        hasCompletedOnboarding,
        isAuthenticated: Boolean(session),
        isReady,
        isSupabaseConfigured,
        session,
        completeOnboarding,
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
