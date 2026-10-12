import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { SurahListItem } from '@/components/surah-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useSurahs } from '@/features/quran/api';
import { useTheme } from '@/hooks/use-theme';

import type { SurahSummary } from '@/features/quran/types';

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

type ListRow = { kind: 'header'; juz: number; collapsed: boolean } | { kind: 'surah'; surah: SurahSummary };

/** Groups surahs under the Juz each one *starts* in -- a surah can span
 * several juz, but every Mushaf index lists it once, under the one it
 * opens in, so this does the same rather than inventing a different
 * convention. Returns the sticky header positions alongside the flattened
 * rows since FlashList wants indices into the final array, not juz
 * numbers. */
function buildRows(surahs: SurahSummary[], collapsedJuz: ReadonlySet<number>) {
  const rows: ListRow[] = [];
  const stickyHeaderIndices: number[] = [];
  let currentJuz: number | null = null;

  for (const surah of surahs) {
    if (surah.starting_juz !== currentJuz) {
      currentJuz = surah.starting_juz;
      stickyHeaderIndices.push(rows.length);
      rows.push({ kind: 'header', juz: currentJuz, collapsed: collapsedJuz.has(currentJuz) });
    }
    if (!collapsedJuz.has(currentJuz)) {
      rows.push({ kind: 'surah', surah });
    }
  }

  return { rows, stickyHeaderIndices };
}

function JuzHeader({ juz, collapsed, onToggle }: { juz: number; collapsed: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onToggle}>
      {({ pressed }) => (
        <ThemedView
          style={[styles.juzHeader, { borderColor: theme.border }, pressed && { opacity: 0.7 }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Juz {juz}
          </ThemedText>
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={theme.textSecondary}
          />
        </ThemedView>
      )}
    </Pressable>
  );
}

export default function SurahListScreen() {
  const { data: surahs, isLoading, error } = useSurahs();
  const [collapsedJuz, setCollapsedJuz] = useState<ReadonlySet<number>>(new Set());

  const { rows, stickyHeaderIndices } = useMemo(
    () => (surahs ? buildRows(surahs, collapsedJuz) : { rows: [], stickyHeaderIndices: [] }),
    [surahs, collapsedJuz]
  );

  function toggleJuz(juz: number) {
    setCollapsedJuz((prev) => {
      const next = new Set(prev);
      if (next.has(juz)) {
        next.delete(juz);
      } else {
        next.add(juz);
      }
      return next;
    });
  }

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
            data={rows}
            keyExtractor={(row) => (row.kind === 'header' ? `juz-${row.juz}` : String(row.surah.surah_number))}
            getItemType={(row) => row.kind}
            stickyHeaderIndices={stickyHeaderIndices}
            renderItem={({ item }) =>
              item.kind === 'header' ? (
                <JuzHeader juz={item.juz} collapsed={item.collapsed} onToggle={() => toggleJuz(item.juz)} />
              ) : (
                <SurahListItem surah={item.surah} />
              )
            }
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
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  juzHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderBottomWidth: 1,
  },
});
