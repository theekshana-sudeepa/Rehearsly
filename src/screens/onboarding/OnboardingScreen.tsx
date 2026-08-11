import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { CrisisSupport } from '@/components/CrisisSupport';
import { Button, Card, Screen, TextField } from '@/components/ui';
import { checkForCrisisContent, type CrisisCategory } from '@/lib/safety';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { OnboardingVariant } from '@/types/database';

/** Preview chips for Variant A — the real catalogue loads from Supabase later. */
const PREVIEW_CATEGORIES = [
  'Giving hard feedback',
  'Setting a boundary',
  'Saying no',
  'A family conversation',
  'New-manager moments',
] as const;

const COPY: Record<OnboardingVariant, { heading: string; sub: string; cta: string }> = {
  A: {
    heading: 'What would you like to practise?',
    sub: 'Pick the kind of conversation that’s been sitting on your chest. You can change your mind any time.',
    cta: 'Show me the scenarios',
  },
  B: {
    heading: 'What conversation is coming up?',
    sub: 'Describe it in your own words — a sentence is plenty. We’ll build a rehearsal partner around it.',
    cta: 'Start from my situation',
  },
};

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState('');
  const [crisis, setCrisis] = useState<{ visible: boolean; category: CrisisCategory | null }>({
    visible: false,
    category: null,
  });

  const assignVariant = useOnboardingStore((state) => state.assignVariant);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const setPendingCustomScenario = useOnboardingStore((state) => state.setPendingCustomScenario);
  const storedVariant = useOnboardingStore((state) => state.variant);

  // Assign on mount so the arm is fixed before the user sees any variant-specific UI.
  useEffect(() => {
    assignVariant();
  }, [assignVariant]);

  const variant: OnboardingVariant = storedVariant ?? 'A';
  const copy = useMemo(() => COPY[variant], [variant]);

  function finish() {
    if (variant === 'B') {
      const trimmed = situation.trim();

      // Safety runs before the text is stored or ever leaves the device.
      const verdict = checkForCrisisContent(trimmed);
      if (verdict.blocked) {
        setCrisis({ visible: true, category: verdict.category });
        return;
      }

      setPendingCustomScenario(trimmed.length > 0 ? trimmed : null);
    }

    completeOnboarding();
  }

  if (step === 0) {
    return (
      <Screen scroll>
        <View className="flex-1 justify-center py-12">
          <Text className="mb-3 text-display font-bold text-ink">Rehearsly</Text>
          <Text className="mb-6 text-callout text-ink-muted">
            Rehearse the conversation you’re dreading, with a partner who pushes back like a real
            person — so the real thing feels familiar instead of frightening.
          </Text>

          <Card className="mb-8 bg-clay-50 border-clay-100">
            <Text className="text-footnote text-ink-muted">
              Rehearsly is a practice tool, not therapy or crisis support. If something heavier is
              going on, we’ll point you to people who can actually help.
            </Text>
          </Card>

          <Button label="Get started" onPress={() => setStep(1)} />
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen scroll>
        <View className="flex-1 py-12">
          <Text className="mb-2 text-title1 font-bold text-ink">{copy.heading}</Text>
          <Text className="mb-6 text-body text-ink-muted">{copy.sub}</Text>

          {variant === 'A' ? (
            <View className="mb-8 flex-row flex-wrap gap-2">
              {PREVIEW_CATEGORIES.map((label) => (
                <View key={label} className="rounded-pill border border-border bg-surface px-4 py-2">
                  <Text className="text-footnote text-ink">{label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="mb-8">
              <TextField
                label="The conversation"
                value={situation}
                onChangeText={setSituation}
                placeholder="I need to tell my manager that the way they give feedback is landing badly."
                multiline
                rows={5}
                maxLength={500}
                helper="Optional — you can skip this and browse scenarios instead."
              />
            </View>
          )}

          <Button label={copy.cta} onPress={finish} />
          <Button label="Skip for now" onPress={completeOnboarding} variant="ghost" className="mt-2" />

          <Text className="mt-6 text-center text-caption text-ink-faint">
            Onboarding variant {variant}
          </Text>
        </View>
      </Screen>

      <CrisisSupport
        visible={crisis.visible}
        category={crisis.category}
        onDismiss={() => {
          setCrisis({ visible: false, category: null });
          setSituation('');
        }}
      />
    </>
  );
}
