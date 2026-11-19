import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import type { RootStackParamList } from '@/navigation/types';

const REASON_COPY: Record<RootStackParamList['Paywall']['reason'], string> = {
  session_limit: 'You’ve used your three free rehearsals this week.',
  custom_scenario: 'Custom scenarios are part of Premium.',
  premium_category: 'This category is part of Premium.',
};

/**
 * Week 3 replaces this with RevenueCatUI.presentPaywall() — the prebuilt
 * component, not a hand-built screen. Kept as a route now so
 * the gating call sites can already navigate here with a reason.
 */
export function PaywallScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Paywall'>>();

  return (
    <Screen scroll>
      <View className="py-4">
        <Text className="mb-2 text-title2 font-bold text-ink">Rehearsly Premium</Text>
        <Text className="mb-6 text-body text-ink-muted">{REASON_COPY[params.reason]}</Text>

        <Card className="mb-4">
          <Text className="mb-2 text-footnote font-semibold text-ink">Premium includes</Text>
          {[
            'Unlimited rehearsals',
            'Every scenario category',
            'Your own custom situations',
            'Feedback history and score trends',
          ].map((line) => (
            <Text key={line} className="mb-1.5 text-body text-ink-muted">
              • {line}
            </Text>
          ))}
        </Card>

        <Card className="mb-6 border-clay-100 bg-clay-50">
          <Text className="mb-1 text-footnote font-semibold text-ink">Not wired yet</Text>
          <Text className="text-footnote text-ink-muted">
            RevenueCat’s prebuilt paywall, the `premium` entitlement, and the weekly/annual
            offering land in Week 3 (Aug 25–31).
          </Text>
        </Card>

        <Button label="Maybe later" onPress={() => navigation.goBack()} variant="secondary" />
      </View>
    </Screen>
  );
}
