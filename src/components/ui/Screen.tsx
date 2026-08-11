import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView. Off for chat screens that manage their own list. */
  scroll?: boolean;
  /** Remove the default horizontal gutter (for edge-to-edge lists). */
  flush?: boolean;
  className?: string;
}

/**
 * Standard screen container: warm background, safe-area aware, consistent gutter.
 */
export function Screen({ children, scroll = false, flush = false, className }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = flush ? '' : 'px-gutter';

  if (scroll) {
    return (
      <View className="flex-1 bg-cream">
        <ScrollView
          className={`flex-1 ${padding} ${className ?? ''}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View className={`flex-1 bg-cream ${padding} ${className ?? ''}`}>{children}</View>;
}
