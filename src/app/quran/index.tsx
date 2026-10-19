import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
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
type RevelationFilter = 'all' | 'Meccan' | 'Medinan';

/** Ported from an AI Studio-generated prototype's surah directory -- a
 * real, useful addition this list didn't have (search + Meccan/Medinan
 * filter), using this app's own real `revelation_type` field rather than
 * anything from that prototype's data. */
function SurahSearchBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  filter: RevelationFilter;
  onFilterChange: (f: RevelationFilter) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.searchSection}>
      <View style={[styles.searchInputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search by name or number..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {query.length > 0 && (
          <Pressable onPress={() => onQueryChange('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'Meccan', 'Medinan'] as const).map((option) => {
          const selected = filter === option;
          return (
            <Pressable key={option} onPress={() => onFilterChange(option)}>
              <View
                style={[
                  styles.filterChip,
                  selected
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: theme.backgroundElement, borderWidth: 1, borderColor: theme.border },
                ]}>
                <ThemedText type="small" themeColor={selected ? 'background' : 'text'}>
                  {option === 'all' ? 'All' : option}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');

  const filteredSurahs = useMemo(() => {
    if (!surahs) return undefined;
    const query = searchQuery.trim().toLowerCase();
    return surahs.filter((surah) => {
      const matchesQuery =
        query.length === 0 ||
        surah.surah_name_en.toLowerCase().includes(query) ||
        surah.surah_name_translation_en.toLowerCase().includes(query) ||
        surah.surah_name_ar.includes(searchQuery.trim()) ||
        String(surah.surah_number) === query;
      const matchesFilter = revelationFilter === 'all' || surah.revelation_type === revelationFilter;
      return matchesQuery && matchesFilter;
    });
  }, [surahs, searchQuery, revelationFilter]);

  const { rows, stickyHeaderIndices } = useMemo(
    () =>
      filteredSurahs
        ? viewMode === 'juz'
          ? buildJuzRows(filteredSurahs, collapsedJuz)
          : buildSuraRows(filteredSurahs)
        : { rows: [], stickyHeaderIndices: [] },
    [filteredSurahs, collapsedJuz, viewMode]
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

      <SurahSearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        filter={revelationFilter}
        onFilterChange={setRevelationFilter}
      />

      <View style={styles.listSectionHeader}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {viewMode === 'juz' ? 'Juz List' : 'Sura List'}
        </ThemedText>
        <ViewModeDropdown mode={viewMode} onChange={setViewMode} />
      </View>

      {filteredSurahs && filteredSurahs.length === 0 && (
        <EmptyState icon="search-outline" message="No surahs match your search." />
      )}
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
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
  searchSection: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.card,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
});
