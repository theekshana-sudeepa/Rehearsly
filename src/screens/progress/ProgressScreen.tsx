import { Text, View } from 'react-native';
import { Card, Screen } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export function ProgressScreen() {
  const profile = useAuthStore((state) => state.profile);
  const streak = profile?.streak_count ?? 0;

  return (
    <Screen scroll>
      <View className="py-4">
        <Card className="mb-6">
          <Text className="mb-1 text-caption font-semibold uppercase tracking-wide text-ink-faint">
            Streak
          </Text>
          <Text className="text-title1 font-bold text-ink">
            {streak} {streak === 1 ? 'day' : 'days'}
          </Text>
          <Text className="mt-1 text-footnote text-ink-muted">
            Last practised: {profile?.last_practice_date ?? 'not yet'}
          </Text>
        </Card>

        <Text className="mb-3 text-title3 font-semibold text-ink">History</Text>
        <Card className="border-clay-100 bg-clay-50">
          <Text className="mb-1 text-footnote font-semibold text-ink">Not built yet</Text>
          <Text className="text-footnote text-ink-muted">
            The streak calendar and per-session score trends land alongside real sessions in
            Week 3.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
