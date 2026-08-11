import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/tokens';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Validation or helper copy shown under the field. */
  error?: string | null;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
  /** Visible rows when multiline. */
  rows?: number;
  maxLength?: number;
  editable?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error = null,
  helper,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  rows = 4,
  maxLength,
  editable = true,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-rose-500'
    : focused
      ? 'border-clay-500'
      : 'border-border';

  return (
    <View>
      <Text className="mb-1.5 text-footnote font-medium text-ink-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.ink.faint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={!secureTextEntry}
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={multiline ? { minHeight: rows * 24 } : undefined}
        className={`rounded-card border bg-surface px-4 py-3 text-body text-ink ${borderClass} ${
          editable ? '' : 'opacity-60'
        }`}
      />
      {(error ?? helper) ? (
        <Text className={`mt-1.5 text-footnote ${error ? 'text-rose-700' : 'text-ink-faint'}`}>
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
}
