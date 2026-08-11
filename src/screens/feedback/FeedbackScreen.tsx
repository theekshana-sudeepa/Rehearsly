import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import type { RootStackParamList } from '@/navigation/types';
import type { SessionFeedback } from '@/types/database';

const SCORE_LABELS: { key: keyof Pick<SessionFeedback, 'clarity' | 'empathy' | 'assertiveness' | 'confidence'>; label: string }[] = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'assertiveness', label: 'Assertiveness' },
  { key: 'confidence', label: 'Confidence' },
];

/**
 * Week 3 wires this to real structured feedback from the model. The score row
 * is rendered from the typed SessionFeedback shape now so the contract with the
 * Edge Function is already fixed (CLAUDE.md §4.7).
 */
export function FeedbackScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Feedback'>>();
  const feedback = params.feedback;

  return (
    <Screen scroll>
      <View className="py-4">
        <Text className="mb-6 text-title2 font-bold text-ink">How that went</Text>

        <View className="mb-6 gap-3">
          {SCORE_LABELS.map(({ key, label }) => {
            const score = feedback?.[key] ?? null;
            return (
              <Card key={key}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-body font-medium text-ink">{label}</Text>
                  <Text className="text-body text-ink-muted">
                    {score === null ? '—' : `${score} / 5`}
                  </Text>
                </View>
                <View className="mt-2 h-2 flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <View
                      key={step}
                      className={`h-2 flex-1 rounded-pill ${
                        score !== null && step <= score ? 'bg-clay-500' : 'bg-border'
                      }`}
                    />
                  ))}
                </View>
              </Card>
            );
          })}
        </View>

        {feedback ? (
          <>
            <Card className="mb-4 border-sage-500 bg-sage-100">
              <Text className="mb-1 text-footnote font-semibold text-ink">What worked</Text>
              <Text className="text-body text-ink-muted">{feedback.whatWorked}</Text>
            </Card>
            <Card className="mb-6">
              <Text className="mb-2 text-footnote font-semibold text-ink">Try next time</Text>
              {feedback.tips.map((tip) => (
                <Text key={tip} className="mb-1.5 text-body text-ink-muted">
                  • {tip}
                </Text>
              ))}
            </Card>
          </>
        ) : (
          <Card className="mb-6 border-clay-100 bg-clay-50">
            <Text className="mb-1 text-footnote font-semibold text-ink">Not built yet</Text>
            <Text className="text-footnote text-ink-muted">
              Structured scoring arrives in Week 3 (Aug 25–31). Session {params.sessionId}.
            </Text>
          </Card>
        )}

        <Button label="Practice again" onPress={() => navigation.navigate('ScenarioPicker')} />
        <Button
          label="Back to home"
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          variant="secondary"
          className="mt-3"
        />
      </View>
    </Screen>
  );
}
