import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { RecentsStrip } from '@/components/recents-strip';
import { Skeleton } from '@/components/skeleton';
import { SurahListItem } from '@/components/surah-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useRecentSurahs } from '@/features/khatmah/api';
import { useSurahs } from '@/features/quran/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

import type { SurahSummary } from '@/features/quran/types';

type ViewMode = 'sura' | 'juz';

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
function buildJuzRows(surahs: SurahSummary[], collapsedJuz: ReadonlySet<number>) {
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

/** The flat "View: Sura" mode -- plain surah-number order, no Juz
 * groupings or sticky headers at all. Matches Muslim Pro's default Quran
 * tab list (confirmed from its real screenshots), with the Juz-grouped
 * view (this app's own pre-existing, intentional feature) one tap away via
 * the view-mode dropdown rather than replaced. */
function buildSuraRows(surahs: SurahSummary[]) {
  return { rows: surahs.map((surah): ListRow => ({ kind: 'surah', surah })), stickyHeaderIndices: [] as number[] };
}

/** Muslim Pro's "View: Sura ▾" dropdown atop its Sura List / Juz List
 * section, toggling between the flat and Juz-grouped layouts. A minimal
 * two-option menu rather than a native picker -- React Native has no
 * built-in `<select>`, and this app already reveals an inline options row
 * on tap for the same kind of small, fixed choice set (see the reading
 * theme toggle in quran/[surah].tsx). */
function ViewModeDropdown({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.viewDropdownWrapper}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        hitSlop={8}
        style={[styles.viewDropdownButton, { borderColor: theme.border }]}>
        <ThemedText type="small" themeColor="text">
          View: {mode === 'sura' ? 'Sura' : 'Juz'}
        </ThemedText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={theme.text} />
      </Pressable>

      {open && (
        <ThemedView type="backgroundElement" style={[styles.viewDropdownMenu, { borderColor: theme.border }]}>
          {(['sura', 'juz'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={styles.viewDropdownOption}>
              <ThemedText type="small" themeColor={option === mode ? 'primary' : 'text'}>
                {option === 'sura' ? 'Sura' : 'Juz'}
              </ThemedText>
              {option === mode && <Ionicons name="checkmark" size={14} color={theme.primary} />}
            </Pressable>
          ))}
        </ThemedView>
      )}
    </View>
  );
}

function JuzHeader({ juz, collapsed, onToggle }: { juz: number; collapsed: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onToggle}>
      {({ pressed }) => (
        <ThemedView type="backgroundSelected" style={[styles.juzHeader, pressed && { opacity: 0.7 }]}>
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: recentSurahs } = useRecentSurahs();
  const [collapsedJuz, setCollapsedJuz] = useState<ReadonlySet<number>>(new Set());
  // Muslim Pro's own default is the flat Sura view (confirmed from its real
  // screenshots), with Juz grouping -- this app's own pre-existing feature
  // -- one tap away via the dropdown rather than lost.
  const [viewMode, setViewMode] = useState<ViewMode>('sura');

  const { rows, stickyHeaderIndices } = useMemo(
    () =>
      surahs
        ? viewMode === 'juz'
          ? buildJuzRows(surahs, collapsedJuz)
          : buildSuraRows(surahs)
        : { rows: [], stickyHeaderIndices: [] },
    [surahs, collapsedJuz, viewMode]
  );

  const surahsByNumber = useMemo(
    () => new Map((surahs ?? []).map((surah) => [surah.surah_number, surah])),
    [surahs]
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

  const listHeader = (
    <>
      {accessToken && recentSurahs && recentSurahs.items.length > 0 && (
        <RecentsStrip items={recentSurahs.items} surahsByNumber={surahsByNumber} />
      )}

      <View style={styles.listSectionHeader}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {viewMode === 'juz' ? 'Juz List' : 'Sura List'}
        </ThemedText>
        <ViewModeDropdown mode={viewMode} onChange={setViewMode} />
      </View>
    </>
  );

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
            ListHeaderComponent={listHeader}
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
    // Real breathing room on both sides instead of a thin border crammed
    // against the surrounding rows -- the previous version read as
    // cramped between one Juz's last surah and the next Juz's header.
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
  },
  listSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  viewDropdownWrapper: {
    position: 'relative',
  },
  viewDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  viewDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
    minWidth: 110,
    zIndex: 10,
  },
  viewDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
