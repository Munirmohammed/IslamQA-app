import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsSection, type SettingsRowItem } from '@/components/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useLogin, useLogout, useMe, useRegister } from '@/features/auth/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

const TOOLS: SettingsRowItem[] = [
  { icon: 'time-outline', label: 'Prayers', href: '/more/prayer-times' },
  { icon: 'compass-outline', label: 'Qibla Direction', href: '/more/qibla' },
  { icon: 'calendar-outline', label: 'Islamic Calendar', href: '/more/calendar' },
  { icon: 'flower-outline', label: 'Dua & Azkar', href: '/more/azkar' },
  { icon: 'book-outline', label: 'Hadith', href: '/more/hadith' },
  { icon: 'cash-outline', label: 'Zakat Calculator', href: '/more/zakat' },
];

function IslamicTools() {
  return (
    <View style={styles.toolsSection}>
      <ThemedText type="smallBold">Islamic Tools</ThemedText>
      <SettingsSection items={TOOLS} />
    </View>
  );
}

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
        <ThemedText type="small" themeColor="error">
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

export default function MoreScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">More</ThemedText>
          <IslamicTools />
          {/* "Account" labels this section the same way "Islamic Tools"
              labels the one above it -- the login/profile card previously
              sat directly under the tools list with no heading of its own,
              reading as an unannounced jump from one list idiom straight
              into an unrelated card. */}
          <View style={styles.accountSection}>
            <ThemedText type="smallBold">Account</ThemedText>
            {accessToken ? <ProfileDetails /> : <AuthForm />}
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  toolsSection: {
    gap: Spacing.two,
  },
  accountSection: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  switchModeText: {
    textAlign: 'center',
  },
});
