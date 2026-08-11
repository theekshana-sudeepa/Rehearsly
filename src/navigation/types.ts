import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SessionFeedback } from '@/types/database';

/** Bottom tabs shown once a user is signed in and past onboarding. */
export type TabParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};

/** The root stack. Modal-ish flows sit above the tabs. */
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  ScenarioPicker: undefined;
  CustomScenario: undefined;
  /**
   * A roleplay is started either from a preset scenario or from custom text.
   * Exactly one of scenarioId / customText is set; the screen validates this.
   */
  Roleplay: { scenarioId: string; customText?: never } | { scenarioId?: never; customText: string };
  Feedback: { sessionId: string; feedback?: SessionFeedback };
  Paywall: { reason: 'session_limit' | 'custom_scenario' | 'premium_category' };
};

/** Registers the param list globally so useNavigation() is typed without generics. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
