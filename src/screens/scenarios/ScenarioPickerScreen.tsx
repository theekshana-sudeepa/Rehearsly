import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import type { Scenario, ScenarioCategory } from '@/types/database';

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  workplace_feedback: 'Workplace feedback',
  boundaries: 'Setting boundaries',
  saying_no: 'Saying no without guilt',
  family: 'Difficult family conversations',
  career_coaching: 'Career & new-manager',
  custom: 'Custom',
};

const DIFFICULTY_STYLE: Record<Scenario['difficulty'], string> = {
  easy: 'bg-sage-100 text-sage-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};

export function ScenarioPickerScreen() {
  const navigation = useNavigation();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(
    supabase ? null : 'Connect Supabase to load the scenario catalogue.',
  );
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    void (async () => {
      const { data, error: queryError } = await supabase
        .from('scenarios')
        .select('*')
        .order('category', { ascending: true });

      if (cancelled) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        setScenarios(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  function retry() {
    if (!supabase) {
      setError('Connect Supabase to load the scenario catalogue.');
      return;
    }
    setLoading(true);
    setError(null);
    setReloadCount((count) => count + 1);
  }

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.clay[500]} />
        </View>
      </Screen>
    );
  }

  // Group by category so the grid reads as the five preset scenario categories.
  const grouped = scenarios.reduce<Partial<Record<ScenarioCategory, Scenario[]>>>(
    (accumulator, scenario) => {
      const bucket = accumulator[scenario.category] ?? [];
      bucket.push(scenario);
      accumulator[scenario.category] = bucket;
      return accumulator;
    },
    {},
  );

  return (
    <Screen scroll>
      <View className="py-4">
        {error ? (
          <Card className="mb-4 border-amber-500 bg-amber-100">
            <Text className="mb-2 text-footnote text-ink">{error}</Text>
            <Button label="Try again" onPress={retry} variant="secondary" />
          </Card>
        ) : null}

        {scenarios.length === 0 && !error ? (
          <Card>
            <Text className="text-body text-ink-muted">
              No scenarios yet. Run the Supabase migrations to seed the catalogue.
            </Text>
          </Card>
        ) : null}

        {(Object.keys(grouped) as ScenarioCategory[]).map((category) => (
          <View key={category} className="mb-6">
            <Text className="mb-3 text-title3 font-semibold text-ink">
              {CATEGORY_LABELS[category]}
            </Text>
            <View className="gap-3">
              {(grouped[category] ?? []).map((scenario) => (
                <Card
                  key={scenario.id}
                  onPress={() => navigation.navigate('Roleplay', { scenarioId: scenario.id })}
                  accessibilityLabel={`Rehearse: ${scenario.title}`}
                >
                  <View className="mb-1.5 flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-callout font-semibold text-ink">
                      {scenario.title}
                    </Text>
                    <View className={`rounded-pill px-2.5 py-1 ${DIFFICULTY_STYLE[scenario.difficulty]}`}>
                      <Text className="text-caption font-semibold capitalize">
                        {scenario.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-footnote text-ink-muted">{scenario.description}</Text>
                  {scenario.is_premium ? (
                    <Text className="mt-2 text-caption font-semibold text-clay-600">Premium</Text>
                  ) : null}
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}
