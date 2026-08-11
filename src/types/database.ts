/**
 * Hand-written mirror of the Supabase schema in supabase/migrations/.
 *
 * Regenerate-able later with `supabase gen types typescript`, but kept explicit
 * for now so the shapes are readable next to the migrations they describe.
 */

export type OnboardingVariant = 'A' | 'B';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ScenarioCategory =
  | 'workplace_feedback'
  | 'boundaries'
  | 'saying_no'
  | 'family'
  | 'career_coaching'
  | 'custom';

export interface Profile {
  id: string;
  streak_count: number;
  last_practice_date: string | null;
  onboarding_variant: OnboardingVariant | null;
  created_at: string;
}

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  difficulty: Difficulty;
  system_prompt: string;
  is_premium: boolean;
}

/** One turn of a roleplay. Stored as the `transcript` jsonb array. */
export interface TranscriptTurn {
  role: 'user' | 'partner';
  content: string;
  at: string;
}

/** Structured feedback returned by the model. Stored as the `feedback` jsonb. */
export interface SessionFeedback {
  clarity: number;
  empathy: number;
  assertiveness: number;
  confidence: number;
  whatWorked: string;
  tips: string[];
}

export interface PracticeSession {
  id: string;
  user_id: string;
  scenario_id: string | null;
  custom_scenario_text: string | null;
  transcript: TranscriptTurn[];
  feedback: SessionFeedback | null;
  duration_seconds: number | null;
  created_at: string;
}

/** Shape passed to supabase-js so queries are typed. */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, 'id'>> & { id: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      scenarios: {
        Row: Scenario;
        Insert: Omit<Scenario, 'id'> & { id?: string };
        Update: Partial<Omit<Scenario, 'id'>>;
      };
      sessions: {
        Row: PracticeSession;
        Insert: Omit<PracticeSession, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PracticeSession, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
}
