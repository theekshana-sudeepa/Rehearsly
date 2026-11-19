import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { CrisisSupport } from '@/components/CrisisSupport';
import { Button, Card, Screen, TextField } from '@/components/ui';
import { checkForCrisisContent, type CrisisCategory } from '@/lib/safety';

const MIN_LENGTH = 15;

const EXAMPLES = [
  'My teammate keeps taking credit for my work in standups.',
  'I need to tell my sister I can’t host the holidays this year.',
  'A client wants extra scope for free and I keep caving.',
] as const;

export function CustomScenarioScreen() {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [crisis, setCrisis] = useState<{ visible: boolean; category: CrisisCategory | null }>({
    visible: false,
    category: null,
  });

  function start() {
    const trimmed = text.trim();

    if (trimmed.length < MIN_LENGTH) {
      setError('Add a little more detail so your partner can play the part convincingly.');
      return;
    }

    // Safety gate before anything leaves the device.
    const verdict = checkForCrisisContent(trimmed);
    if (verdict.blocked) {
      setCrisis({ visible: true, category: verdict.category });
      return;
    }

    setError(null);
    navigation.navigate('Roleplay', { customText: trimmed });
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Screen scroll>
          <View className="py-4">
            <Text className="mb-2 text-title2 font-bold text-ink">
              What conversation is coming up?
            </Text>
            <Text className="mb-6 text-body text-ink-muted">
              Describe it the way you’d tell a friend. Who is it with, and what makes it hard?
            </Text>

            <TextField
              label="Your situation"
              value={text}
              onChangeText={(value) => {
                setText(value);
                if (error) setError(null);
              }}
              placeholder="I need to tell my manager that the way they give feedback is landing badly."
              multiline
              rows={6}
              maxLength={500}
              error={error}
              helper={`${text.trim().length}/500`}
            />

            <Card className="mt-6">
              <Text className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-faint">
                Examples
              </Text>
              {EXAMPLES.map((example) => (
                <Text key={example} className="mb-1.5 text-footnote text-ink-muted">
                  • {example}
                </Text>
              ))}
            </Card>

            <Button label="Start rehearsing" onPress={start} className="mt-6" />
          </View>
        </Screen>
      </KeyboardAvoidingView>

      <CrisisSupport
        visible={crisis.visible}
        category={crisis.category}
        onDismiss={() => {
          setCrisis({ visible: false, category: null });
          navigation.goBack();
        }}
      />
    </>
  );
}
