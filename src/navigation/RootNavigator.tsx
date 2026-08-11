import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { CustomScenarioScreen } from '@/screens/scenarios/CustomScenarioScreen';
import { FeedbackScreen } from '@/screens/feedback/FeedbackScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { PaywallScreen } from '@/screens/paywall/PaywallScreen';
import { RoleplayScreen } from '@/screens/roleplay/RoleplayScreen';
import { ScenarioPickerScreen } from '@/screens/scenarios/ScenarioPickerScreen';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, navigationColors } from '@/theme/tokens';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, ...navigationColors },
};

function BootSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <ActivityIndicator color={colors.clay[500]} />
    </View>
  );
}

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  const initialise = useAuthStore((state) => state.initialise);
  const completedOnboarding = useOnboardingStore((state) => state.completedOnboarding);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  if (status === 'initialising') return <BootSplash />;

  // `unconfigured` (no Supabase keys) still reaches the app shell so a fresh
  // clone is explorable and shows a readable setup notice on Home.
  const signedIn = status === 'authenticated' || status === 'unconfigured';

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.cream },
          headerShadowVisible: false,
          headerTintColor: colors.ink.DEFAULT,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        {!completedOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : !signedIn ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="ScenarioPicker"
              component={ScenarioPickerScreen}
              options={{ title: 'Choose a scenario' }}
            />
            <Stack.Screen
              name="CustomScenario"
              component={CustomScenarioScreen}
              options={{ title: 'Your situation' }}
            />
            <Stack.Screen
              name="Roleplay"
              component={RoleplayScreen}
              options={{ title: 'Rehearsal', headerBackTitle: 'Leave' }}
            />
            <Stack.Screen
              name="Feedback"
              component={FeedbackScreen}
              options={{ title: 'Your feedback', headerBackVisible: false }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal', title: 'Rehearsly Premium' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
