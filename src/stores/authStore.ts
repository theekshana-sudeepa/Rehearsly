import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export type AuthStatus = 'initialising' | 'authenticated' | 'unauthenticated' | 'unconfigured';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Last auth error, shown inline on the auth screen. */
  error: string | null;
  /** True while a sign-in/sign-up request is in flight. */
  busy: boolean;

  initialise: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/** supabase-js errors are not always Error instances; normalise for display. */
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong. Please try again.';
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'initialising',
  session: null,
  user: null,
  profile: null,
  error: null,
  busy: false,

  initialise: async () => {
    if (!supabase) {
      // No backend configured — the app still boots and shows a setup notice.
      set({ status: 'unconfigured' });
      return;
    }

    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      status: data.session ? 'authenticated' : 'unauthenticated',
    });

    if (data.session) void get().refreshProfile();

    // Keep the store in sync with token refreshes and sign-outs from any source.
    unsubscribe?.();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
        profile: session ? get().profile : null,
      });
      if (session) void get().refreshProfile();
    });
    unsubscribe = () => subscription.subscription.unsubscribe();
  },

  signUp: async (email, password) => {
    if (!supabase) return set({ error: 'Supabase is not configured.' });
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    set({ busy: false, error: error ? messageOf(error) : null });
  },

  signIn: async (email, password) => {
    if (!supabase) return set({ error: 'Supabase is not configured.' });
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    set({ busy: false, error: error ? messageOf(error) : null });
  },

  signOut: async () => {
    if (!supabase) return;
    set({ busy: true });
    await supabase.auth.signOut();
    set({ busy: false, profile: null, error: null });
  },

  refreshProfile: async () => {
    const userId = get().user?.id;
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // A missing profile is not an error worth surfacing: the handle_new_user
    // trigger creates it, and the UI degrades to a zero streak meanwhile.
    if (!error && data) set({ profile: data });
  },

  clearError: () => set({ error: null }),
}));

/** Convenience selector — true once we know whether the user is signed in. */
export function selectIsReady(state: AuthState): boolean {
  return state.status !== 'initialising';
}

export { isSupabaseConfigured };
