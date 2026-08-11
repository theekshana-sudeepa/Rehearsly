/**
 * Supabase client.
 *
 * `react-native-url-polyfill` must be imported before supabase-js: the SDK
 * relies on URL/URLSearchParams, which Hermes does not fully implement.
 */
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';
import type { Database } from '@/types/database';

export type RehearslyClient = SupabaseClient<Database>;

/**
 * Null when Supabase env vars are unset, so the app still boots and can show a
 * readable configuration notice instead of crashing at import time.
 * Use `requireSupabase()` at call sites that genuinely need it.
 */
export const supabase: RehearslyClient | null = isSupabaseConfigured
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Mobile has no URL to parse a session out of; deep links are handled
        // explicitly where magic links are used.
        detectSessionInUrl: false,
      },
    })
  : null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Copy .env.example to .env and set ' +
        'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function requireSupabase(): RehearslyClient {
  if (!supabase) throw new SupabaseNotConfiguredError();
  return supabase;
}
