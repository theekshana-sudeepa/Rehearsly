import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-clay-500 active:bg-clay-600',
  secondary: 'bg-surface border border-border active:bg-clay-50',
  ghost: 'bg-transparent active:bg-clay-50',
  danger: 'bg-rose-100 border border-rose-500 active:bg-rose-100',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-surface',
  secondary: 'text-ink',
  ghost: 'text-clay-600',
  danger: 'text-rose-700',
};

const SPINNER: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#2A2320',
  ghost: '#A94F2E',
  danger: '#8C332E',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const inert = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: loading }}
      accessibilityLabel={label}
      disabled={inert}
      onPress={onPress}
      className={`min-h-[52px] flex-row items-center justify-center rounded-pill px-6 ${
        CONTAINER[variant]
      } ${inert ? 'opacity-40' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER[variant]} />
      ) : (
        <Text className={`text-callout font-semibold ${LABEL[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
