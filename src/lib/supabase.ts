import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/src/lib/storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const storageKey = 'planora.supabase.auth';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: {
          getItem: (key) => getStorageItem(`${storageKey}:${key}`),
          setItem: (key, value) => setStorageItem(`${storageKey}:${key}`, value),
          removeItem: (key) => removeStorageItem(`${storageKey}:${key}`),
        },
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
