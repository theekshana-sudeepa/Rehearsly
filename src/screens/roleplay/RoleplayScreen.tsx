import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Week 2 builds the real chat here: message list, typing indicator, and the
 * OpenAI Edge Function call. Week 1 ships the navigable shell so the route
 * contract and the scenario/custom-text split are settled first.
 */
export function RoleplayScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Roleplay'>>();

  const source =
    'customText' in params && params.customText
      ? { label: 'Your situation', detail: params.customText }
      : { label: 'Scenario', detail: params.scenarioId ?? 'unknown' };

  return (
    <Screen scroll>
      <View className="py-4">
        <Card className="mb-4">
          <Text className="mb-1 text-caption font-semibold uppercase tracking-wide text-ink-faint">
            {source.label}
          </Text>
          <Text className="text-body text-ink">{source.detail}</Text>
        </Card>

        <Card className="mb-6 border-clay-100 bg-clay-50">
          <Text className="mb-1 text-footnote font-semibold text-ink">Not built yet</Text>
          <Text className="text-footnote text-ink-muted">
            The chat interface, typing indicator, and roleplay model call land in Week 2
            (Aug 18–24). This screen exists now so the navigation contract is fixed.
          </Text>
        </Card>

        {/* "End & get feedback" is always visible in the real screen (CLAUDE.md §4.3). */}
        <Button
          label="End & get feedback"
          onPress={() => navigation.navigate('Feedback', { sessionId: 'placeholder' })}
        />
      </View>
    </Screen>
  );
}
