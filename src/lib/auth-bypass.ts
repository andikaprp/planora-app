import type { Session } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/src/lib/supabase';

const PREVIEW_USER_ID = 'planora-preview-local';
const previewEmail = 'preview@local.planora';

/**
 * When Supabase env vars are missing, allow entering the app without a remote session
 * (dev by default, or set EXPO_PUBLIC_AUTH_BYPASS=1 for a production-like build).
 */
export const isAuthPreviewEnabled =
  !isSupabaseConfigured && (__DEV__ || process.env.EXPO_PUBLIC_AUTH_BYPASS === '1');

export const previewSessionStorageKey = 'planora.auth.preview';

export function isPreviewUserId(id: string | undefined) {
  return id === PREVIEW_USER_ID;
}

export function createPreviewSession(): Session {
  return {
    access_token: 'preview',
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 365,
    refresh_token: '',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    provider_token: null,
    provider_refresh_token: null,
    user: {
      id: PREVIEW_USER_ID,
      app_metadata: {},
      aud: 'preview',
      created_at: new Date().toISOString(),
      email: previewEmail,
      email_confirmed_at: new Date().toISOString(),
      phone: undefined,
      role: 'authenticated',
      user_metadata: {},
    },
  } as Session;
}
