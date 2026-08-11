import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button, Card, Screen, TextField } from '@/components/ui';
import { describeMissingConfig, isSupabaseConfigured } from '@/lib/env';
import { useAuthStore } from '@/stores/authStore';

type Mode = 'signIn' | 'signUp';

function validate(email: string, password: string, mode: Mode): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
  if (mode === 'signUp' && password.length < 8) {
    return 'Use at least 8 characters for your password.';
  }
  if (password.length === 0) return 'Enter your password.';
  return null;
}

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const busy = useAuthStore((state) => state.busy);
  const remoteError = useAuthStore((state) => state.error);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const clearError = useAuthStore((state) => state.clearError);

  async function submit() {
    setNotice(null);
    const problem = validate(email, password, mode);
    setLocalError(problem);
    if (problem) return;

    clearError();
    if (mode === 'signUp') {
      await signUp(email, password);
      // If the project requires email confirmation, no session arrives yet.
      if (!useAuthStore.getState().error) {
        setNotice('Check your inbox to confirm your email, then sign in.');
      }
    } else {
      await signIn(email, password);
    }
  }

  function switchMode() {
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
    setLocalError(null);
    setNotice(null);
    clearError();
  }

  const error = localError ?? remoteError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <Screen scroll>
        <View className="flex-1 justify-center py-12">
          <Text className="mb-2 text-title1 font-bold text-ink">
            {mode === 'signUp' ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="mb-8 text-body text-ink-muted">
            {mode === 'signUp'
              ? 'Your rehearsals and progress stay tied to your account.'
              : 'Pick up where you left off.'}
          </Text>

          {!isSupabaseConfigured ? (
            <Card className="mb-6 border-amber-500 bg-amber-100">
              <Text className="mb-1 text-footnote font-semibold text-ink">Backend not configured</Text>
              <Text className="text-footnote text-ink-muted">
                Set {describeMissingConfig().join(' and ')} in .env to enable sign-in.
              </Text>
            </Card>
          ) : null}

          <View className="gap-4">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!busy}
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'signUp' ? 'At least 8 characters' : 'Your password'}
              secureTextEntry
              autoCapitalize="none"
              editable={!busy}
              error={error}
            />
          </View>

          {notice ? (
            <Card className="mt-4 border-sage-500 bg-sage-100">
              <Text className="text-footnote text-ink">{notice}</Text>
            </Card>
          ) : null}

          <Button
            label={mode === 'signUp' ? 'Create account' : 'Sign in'}
            onPress={() => void submit()}
            loading={busy}
            disabled={!isSupabaseConfigured}
            className="mt-6"
          />
          <Button
            label={mode === 'signUp' ? 'I already have an account' : 'I need an account'}
            onPress={switchMode}
            variant="ghost"
            disabled={busy}
            className="mt-2"
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
