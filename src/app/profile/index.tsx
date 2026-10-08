import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useLogin, useLogout, useMe, useRegister } from '@/features/auth/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

function AuthForm() {
  const theme = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useLogin();
  const register = useRegister();

  const busy = login.isPending || register.isPending;
  const errorMessage = login.error?.message ?? register.error?.message;

  const submit = async () => {
    if (mode === 'register') {
      await register.mutateAsync({ username, email, password });
    }
    // Register immediately logs in with the same credentials -- the
    // backend's /auth/register doesn't itself return a token, so a
    // register always needs a follow-up login either way.
    await login.mutateAsync({ username, password });
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{mode === 'login' ? 'Log in' : 'Create an account'}</ThemedText>

      <TextInput
        placeholder="Username"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      {mode === 'register' && (
        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
      )}

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      {errorMessage && (
        <ThemedText type="small" style={styles.error}>
          {errorMessage}
        </ThemedText>
      )}

      <Pressable onPress={submit} disabled={busy}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.submitButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <ThemedText type="small" themeColor="primary" style={styles.switchModeText}>
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function ProfileDetails() {
  const { data: me } = useMe();
  const logout = useLogout();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{me?.username}</ThemedText>
      <ThemedText themeColor="textSecondary">{me?.email}</ThemedText>

      <Link href="/profile/hifz" asChild>
        <Pressable>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.submitButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                Hifz Review
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </Link>

      <Link href="/profile/garden" asChild>
        <Pressable>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.submitButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                Hifz Garden
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </Link>

      <Link href="/profile/coach" asChild>
        <Pressable>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.submitButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                Tajweed Coach
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </Link>

      <Link href="/profile/halaqa" asChild>
        <Pressable>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.submitButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                Halaqa
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </Link>

      <Pressable onPress={() => logout.mutate()}>
        {({ pressed }) => (
          <ThemedView style={[styles.submitButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold">Log out</ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </ThemedView>
  );
}

export default function ProfileScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        {accessToken ? <ProfileDetails /> : <AuthForm />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  switchModeText: {
    textAlign: 'center',
  },
  error: {
    color: '#C0392B',
  },
});
