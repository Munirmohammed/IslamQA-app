import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { SurahListItem } from '@/components/surah-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSurahs } from '@/features/quran/api';
import { useTheme } from '@/hooks/use-theme';

function QuickAction({ href, icon, label }: { href: Href; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={{ flex: 1 }}>
        {({ pressed }) => (
          <ThemedView type="primaryMuted" style={[styles.quickAction, pressed && styles.quickActionPressed]}>
            <Ionicons name={icon} size={18} color={theme.primary} />
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
          <QuickAction href="/quran/practice" icon="mic-outline" label="Tasmeea" />
          <QuickAction href="/quran/ask" icon="help-circle-outline" label="Ask the Quran" />
          <QuickAction href="/quran/quiz" icon="shuffle-outline" label="Random Quiz" />
        </View>

        {isLoading && (
          <View style={styles.skeletonList}>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} height={64} borderRadius={Spacing.three} />
            ))}
          </View>
        )}

        {error && (
          <EmptyState
            icon="cloud-offline-outline"
            message="Couldn't reach the server. Check that the backend and tunnel are running, and that EXPO_PUBLIC_API_URL is set."
          />
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
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
  skeletonList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
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
    gap: Spacing.half,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
});
