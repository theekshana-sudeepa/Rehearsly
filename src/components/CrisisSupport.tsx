import { Modal, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { getSupportMessage, type CrisisCategory } from '@/lib/safety';

interface CrisisSupportProps {
  visible: boolean;
  category: CrisisCategory | null;
  onDismiss: () => void;
}

/**
 * Shown in place of a roleplay when the safety intercept fires (CLAUDE.md §2).
 *
 * Deliberate omissions: no "continue anyway" escape hatch, and no way to reach
 * roleplay from here. The only action returns the user to safety.
 */
export function CrisisSupport({ visible, category, onDismiss }: CrisisSupportProps) {
  const message = getSupportMessage(category);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View className="flex-1 justify-end bg-ink/40 p-gutter">
        <Card className="mb-8 bg-surface">
          <View className="mb-3 self-start rounded-pill bg-rose-100 px-3 py-1">
            <Text className="text-caption font-semibold uppercase tracking-wide text-rose-700">
              Support
            </Text>
          </View>

          <Text className="mb-2 text-title3 font-semibold text-ink">{message.title}</Text>
          <Text className="mb-4 text-body text-ink-muted">{message.body}</Text>

          {message.resources.map((resource) => (
            <View key={resource.label} className="mb-3 border-l-2 border-rose-500 pl-3">
              <Text className="text-footnote font-semibold text-ink">{resource.label}</Text>
              <Text className="text-footnote text-ink-muted">{resource.detail}</Text>
            </View>
          ))}

          <Button label={message.dismissLabel} onPress={onDismiss} variant="secondary" className="mt-2" />
        </Card>
      </View>
    </Modal>
  );
}
