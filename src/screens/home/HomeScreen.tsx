import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { describeMissingConfig, isSupabaseConfigured } from '@/lib/env';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export function HomeScreen() {
  const navigation = useNavigation();
  const profile = useAuthStore((state) => state.profile);
  const variant = useOnboardingStore((state) => state.variant);
  const pendingCustom = useOnboardingStore((state) => state.pendingCustomScenario);

  const streak = profile?.streak_count ?? 0;

  return (
    <Screen scroll>
      <View className="py-4">
        {!isSupabaseConfigured ? (
          <Card className="mb-4 border-amber-500 bg-amber-100">
            <Text className="mb-1 text-footnote font-semibold text-ink">Running without a backend</Text>
            <Text className="text-footnote text-ink-muted">
              Set {describeMissingConfig().join(' and ')} in .env to load scenarios and save sessions.
            </Text>
          </Card>
        ) : null}

        {/* Streak — the retention hook that OneSignal campaigns nudge (CLAUDE.md §4.5) */}
        <Card className="mb-6 flex-row items-center justify-between bg-amber-100 border-amber-500">
          <View>
            <Text className="text-caption font-semibold uppercase tracking-wide text-amber-700">
              Current streak
            </Text>
            <Text className="text-title1 font-bold text-ink">
              {streak} {streak === 1 ? 'day' : 'days'}
            </Text>
          </View>
          <Text className="text-display">{streak > 0 ? '🔥' : '🌱'}</Text>
        </Card>

        <Text className="mb-1 text-title2 font-bold text-ink">Practice today</Text>
        <Text className="mb-4 text-body text-ink-muted">
          Two minutes of rehearsal is enough to keep the streak alive.
        </Text>

        {pendingCustom ? (
          <Card className="mb-4">
            <Text className="mb-1 text-caption font-semibold uppercase tracking-wide text-ink-faint">
              Picking up where you left off
            </Text>
            <Text className="mb-3 text-body text-ink" numberOfLines={3}>
              “{pendingCustom}”
            </Text>
            <Button
              label="Rehearse this"
              onPress={() => navigation.navigate('Roleplay', { customText: pendingCustom })}
            />
          </Card>
        ) : null}

        {/* Variant B steered the user toward their own situation, so lead with that. */}
        {variant === 'B' ? (
          <>
            <Button
              label="Describe a situation"
              onPress={() => navigation.navigate('CustomScenario')}
            />
            <Button
              label="Browse scenarios"
              onPress={() => navigation.navigate('ScenarioPicker')}
              variant="secondary"
              className="mt-3"
            />
          </>
        ) : (
          <>
            <Button
              label="Browse scenarios"
              onPress={() => navigation.navigate('ScenarioPicker')}
            />
            <Button
              label="Describe a situation"
              onPress={() => navigation.navigate('CustomScenario')}
              variant="secondary"
              className="mt-3"
            />
          </>
        )}

        <Text className="mb-3 mt-8 text-title3 font-semibold text-ink">Recent rehearsals</Text>
        <Card>
          <Text className="text-body text-ink-muted">
            Nothing yet. Your finished rehearsals and their feedback will appear here.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
