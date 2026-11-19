import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OnboardingVariant } from '@/types/database';

/**
 * Onboarding A/B state for the Layers growth experiment.
 *
 * Hypothesis: users who describe their own situation first (Variant B) complete
 * their first roleplay at a higher rate than users who pick a preset scenario
 * first (Variant A).
 *
 * Assignment is local coin-flip for now. In Week 5 the Layers SDK becomes the
 * assignment source — `assignVariant` is the single seam that has to change,
 * and the persisted variant keeps a user in their arm across launches either way.
 */

interface OnboardingState {
  variant: OnboardingVariant | null;
  completedOnboarding: boolean;
  /** Set once the user finishes their first roleplay — the experiment's success metric. */
  firstRoleplayCompleted: boolean;
  /**
   * Variant B collects the user's own situation during onboarding. Held here so
   * it survives the sign-up detour and Home can offer to pick it straight up.
   */
  pendingCustomScenario: string | null;

  assignVariant: () => OnboardingVariant;
  completeOnboarding: () => void;
  markFirstRoleplayCompleted: () => void;
  setPendingCustomScenario: (text: string | null) => void;
  /** Test/QA helper: wipe local onboarding state. */
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      variant: null,
      completedOnboarding: false,
      firstRoleplayCompleted: false,
      pendingCustomScenario: null,

      assignVariant: () => {
        const existing = get().variant;
        if (existing) return existing;

        const assigned: OnboardingVariant = Math.random() < 0.5 ? 'A' : 'B';
        set({ variant: assigned });
        return assigned;
      },

      completeOnboarding: () => set({ completedOnboarding: true }),

      markFirstRoleplayCompleted: () => {
        // Only the *first* completion is the experiment metric.
        if (get().firstRoleplayCompleted) return;
        set({ firstRoleplayCompleted: true });
      },

      setPendingCustomScenario: (text) => set({ pendingCustomScenario: text }),

      reset: () =>
        set({
          variant: null,
          completedOnboarding: false,
          firstRoleplayCompleted: false,
          pendingCustomScenario: null,
        }),
    }),
    {
      name: 'rehearsly.onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
