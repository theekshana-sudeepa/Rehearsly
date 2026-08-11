import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

/** Surface container. Becomes pressable when given an onPress. */
export function Card({ children, onPress, accessibilityLabel, className }: CardProps) {
  const base = `rounded-card border border-border bg-surface p-4 ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className={`${base} active:bg-clay-50`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
