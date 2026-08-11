import { useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/tokens';

export function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const variant = useOnboardingStore((state) => state.variant);

  // Local for now; Week 4 binds this to the OneSignal subscription + reminder time.
  const [remindersOn, setRemindersOn] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function deleteMyData() {
    const userId = user?.id;
    if (!supabase || !userId) return;

    setDeleting(true);
    // RLS restricts these to the caller's own rows.
    const { error: sessionsError } = await supabase.from('sessions').delete().eq('user_id', userId);
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
    setDeleting(false);

    const failure = sessionsError ?? profileError;
    if (failure) {
      Alert.alert('Could not delete', failure.message);
      return;
    }

    resetOnboarding();
    await signOut();
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your data?',
      'This permanently removes your rehearsals, feedback, and streak. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteMyData() },
      ],
    );
  }

  return (
    <Screen scroll>
      <View className="py-4">
        <Text className="mb-3 text-title3 font-semibold text-ink">Reminders</Text>
        <Card className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-body text-ink">Daily practice reminder</Text>
              <Text className="mt-0.5 text-footnote text-ink-muted">
                A nudge to keep your streak alive.
              </Text>
            </View>
            <Switch
              value={remindersOn}
              onValueChange={setRemindersOn}
              trackColor={{ true: colors.clay[300], false: colors.border }}
              thumbColor={remindersOn ? colors.clay[500] : colors.surface}
            />
          </View>
          <Text className="mt-3 text-caption text-ink-faint">
            Push delivery is wired to OneSignal in Week 4.
          </Text>
        </Card>

        <Text className="mb-3 text-title3 font-semibold text-ink">Account</Text>
        <Card className="mb-3">
          <Text className="text-caption font-semibold uppercase tracking-wide text-ink-faint">
            Signed in as
          </Text>
          <Text className="mt-1 text-body text-ink">{user?.email ?? 'Not signed in'}</Text>
        </Card>
        <Button label="Sign out" onPress={() => void signOut()} variant="secondary" />

        <Text className="mb-3 mt-8 text-title3 font-semibold text-ink">Your data</Text>
        <Card className="mb-3">
          <Text className="text-footnote text-ink-muted">
            Deleting removes every rehearsal, its feedback, and your streak. Removing the login
            record itself needs a server-side call, which lands with the Edge Functions.
          </Text>
        </Card>
        <Button
          label="Delete my data"
          onPress={confirmDelete}
          variant="danger"
          loading={deleting}
          disabled={!user}
        />

        <Text className="mt-8 text-center text-caption text-ink-faint">
          Rehearsly is a practice tool, not therapy or crisis support.
          {variant ? `  ·  Variant ${variant}` : ''}
        </Text>
      </View>
    </Screen>
  );
}
