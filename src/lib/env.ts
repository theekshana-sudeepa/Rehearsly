/**
 * Typed access to EXPO_PUBLIC_* configuration.
 *
 * Deliberately does not throw at import time: a missing Supabase key should
 * surface as a readable in-app message, not a white screen on a judge's or
 * teammate's device. Call `describeMissingConfig()` to report what is unset.
 *
 * OPENAI_API_KEY is intentionally absent here — it is server-side only and
 * lives in Supabase Edge Function secrets.
 */

function read(name: string): string {
  // Expo inlines EXPO_PUBLIC_* at build time, so these must be static lookups.
  const raw: string | undefined = {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
    EXPO_PUBLIC_ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
    EXPO_PUBLIC_LAYERS_API_KEY: process.env.EXPO_PUBLIC_LAYERS_API_KEY,
  }[name];

  return raw?.trim() ?? '';
}

export const env = {
  supabaseUrl: read('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: read('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  revenueCatKeyIos: read('EXPO_PUBLIC_REVENUECAT_API_KEY_IOS'),
  revenueCatKeyAndroid: read('EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID'),
  oneSignalAppId: read('EXPO_PUBLIC_ONESIGNAL_APP_ID'),
  layersApiKey: read('EXPO_PUBLIC_LAYERS_API_KEY'),
} as const;

/** True when Supabase is configured well enough to attempt auth. */
export const isSupabaseConfigured = env.supabaseUrl !== '' && env.supabaseAnonKey !== '';

/** Human-readable list of unset variables, for an in-app diagnostic. */
export function describeMissingConfig(): string[] {
  const missing: string[] = [];
  if (env.supabaseUrl === '') missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (env.supabaseAnonKey === '') missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  return missing;
}
