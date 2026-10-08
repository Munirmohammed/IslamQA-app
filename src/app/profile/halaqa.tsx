import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateHalaqa, useJoinHalaqa, useMyHalaqas } from '@/features/halaqa/api';
import { useTheme } from '@/hooks/use-theme';

import type { Halaqa } from '@/features/halaqa/types';

export default function HalaqaScreen() {
  const { data, isLoading, error } = useMyHalaqas();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.content}>
          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              Loading your circles…
            </ThemedText>
          )}

          {error && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              Couldn&apos;t load your halaqas.
            </ThemedText>
          )}

          {data && data.teaching.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold">Teaching</ThemedText>
              {data.teaching.map((halaqa) => (
                <TeachingRow key={halaqa.id} halaqa={halaqa} />
              ))}
            </View>
          )}

          {data && data.studying.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold">Studying</ThemedText>
              {data.studying.map((halaqa) => (
                <StudyingRow key={halaqa.id} halaqa={halaqa} />
              ))}
            </View>
          )}

          <CreateHalaqaForm />
          <JoinHalaqaForm />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function TeachingRow({ halaqa }: { halaqa: Halaqa }) {
  return (
    <Link
      href={{ pathname: '/profile/halaqa-roster', params: { halaqaId: halaqa.id, halaqaName: halaqa.name } }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.rowPressed]}>
            <ThemedText>{halaqa.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Join code: {halaqa.join_code}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

function StudyingRow({ halaqa }: { halaqa: Halaqa }) {
  return (
    <Link
      href={{
        pathname: '/profile/halaqa-leaderboard',
        params: { halaqaId: halaqa.id, halaqaName: halaqa.name },
      }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.rowPressed]}>
            <ThemedText>{halaqa.name}</ThemedText>
            <ThemedText type="small" themeColor="primary">
              View leaderboard →
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

function CreateHalaqaForm() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const createHalaqa = useCreateHalaqa();

  return (
    <ThemedView type="backgroundElement" style={styles.formCard}>
      <ThemedText type="smallBold">Start a halaqa</ThemedText>
      <TextInput
        placeholder="Circle name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />
      {createHalaqa.isSuccess && (
        <ThemedText type="small" themeColor="primary">
          Created -- join code: {createHalaqa.data.join_code}
        </ThemedText>
      )}
      {createHalaqa.isError && (
        <ThemedText type="small" style={styles.error}>
          {createHalaqa.error.message}
        </ThemedText>
      )}
      <Pressable
        disabled={createHalaqa.isPending || name.trim().length === 0}
        onPress={() => createHalaqa.mutate(name.trim())}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.formButton, (pressed || createHalaqa.isPending) && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              Create
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </ThemedView>
  );
}

function JoinHalaqaForm() {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const joinHalaqa = useJoinHalaqa();

  return (
    <ThemedView type="backgroundElement" style={styles.formCard}>
      <ThemedText type="smallBold">Join a halaqa</ThemedText>
      <TextInput
        placeholder="Join code"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />
      {joinHalaqa.isSuccess && (
        <ThemedText type="small" themeColor="primary">
          Joined!
        </ThemedText>
      )}
      {joinHalaqa.isError && (
        <ThemedText type="small" style={styles.error}>
          {joinHalaqa.error.message}
        </ThemedText>
      )}
      <Pressable
        disabled={joinHalaqa.isPending || code.trim().length === 0}
        onPress={() => joinHalaqa.mutate(code.trim())}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.formButton, (pressed || joinHalaqa.isPending) && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              Join
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
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
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  rowPressed: {
    opacity: 0.7,
  },
  formCard: {
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
  formButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    color: '#C0392B',
  },
});
