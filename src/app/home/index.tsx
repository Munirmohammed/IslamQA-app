import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMe } from '@/features/auth/api';

export default function HomeScreen() {
  const { data: me } = useMe();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Assalamu Alaikum{me ? `, ${me.username}` : ''}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Your Quran companion -- recitation, memorization, and tafsir, all in one place.
        </ThemedText>

        <Link href="/read" asChild>
          <Pressable>
            {({ pressed }) => (
              <ThemedView
                type="primaryMuted"
                style={[styles.cta, pressed && styles.ctaPressed]}>
                <ThemedText type="smallBold" themeColor="primary">
                  Open the Mushaf →
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </Link>

        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Voice recitation checking, streaks, memorization reviews, and tajweed coloring are
          coming in the next phases -- this is the foundation they build on.
        </ThemedText>
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
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    marginBottom: Spacing.three,
  },
  cta: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.8,
  },
  note: {
    marginTop: Spacing.four,
  },
});
