import { FlashList } from '@shopify/flash-list';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurahListItem } from '@/components/surah-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSurahs } from '@/features/quran/api';

function QuickAction({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={{ flex: 1 }}>
        {({ pressed }) => (
          <ThemedView type="primaryMuted" style={[styles.quickAction, pressed && styles.quickActionPressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              {label}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

export default function SurahListScreen() {
  const { data: surahs, isLoading, error } = useSurahs();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.quickActions}>
          <QuickAction href="/quran/practice" label="🎙 Tasmeea" />
          <QuickAction href="/quran/ask" label="Ask the Quran" />
          <QuickAction href="/quran/quiz" label="Random Quiz" />
        </View>

        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading the Quran…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t reach the server. Check that the backend and tunnel are running, and
            that EXPO_PUBLIC_API_URL is set.
          </ThemedText>
        )}

        {surahs && (
          <FlashList
            data={surahs}
            keyExtractor={(item) => String(item.surah_number)}
            renderItem={({ item }) => <SurahListItem surah={item} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
        )}
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
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  quickAction: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  quickActionPressed: {
    opacity: 0.7,
  },
});
