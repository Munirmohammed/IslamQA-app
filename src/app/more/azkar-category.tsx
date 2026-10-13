import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AZKAR_CATEGORIES, type AzkarItem } from '@/lib/azkar-data';
import { useTheme } from '@/hooks/use-theme';

interface ReaderPage {
  chapterName: string;
  item: AzkarItem;
}

type ReaderTab = 'display' | 'audio';

/** Muslim Pro's actual dua reader (confirmed via its Play Store
 * screenshots) pages through one dua at a time -- back/title/overflow
 * header, a Display/Audio tab switcher, then prev/next transport at the
 * bottom. This app's azkar data (src/data/azkar.json, see
 * src/lib/azkar-data.ts) has no audio field at all on an `AzkarItem` --
 * no URL, no reciter, nothing -- so the Audio tab is a real empty state
 * rather than fake playback controls wired to nothing. Prev/next instead
 * page through every real dua in the category (flattened across its
 * chapters), which *is* backed by real data. */
export default function AzkarCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string }>();
  const category = AZKAR_CATEGORIES[Number(params.index)];
  const [tab, setTab] = useState<ReaderTab>('display');
  const [pageIndex, setPageIndex] = useState(0);

  // A fresh category (new `params.index`) always starts back at its first
  // dua -- otherwise leftover page state from a longer category could land
  // out of bounds on a shorter one. This screen stays mounted across
  // param changes (same route), so resetting has to happen here rather
  // than in an effect -- React's own recommended "adjusting state when a
  // prop changes" pattern: setting state mid-render, which triggers an
  // immediate re-render before anything commits, instead of the extra
  // commit+effect+re-render cascade a useEffect would cause.
  const [resetKey, setResetKey] = useState(params.index);
  if (resetKey !== params.index) {
    setResetKey(params.index);
    setPageIndex(0);
    setTab('display');
  }

  const pages: ReaderPage[] = useMemo(
    () =>
      (category?.chapters ?? []).flatMap((chapter) =>
        chapter.items.map((item) => ({ chapterName: chapter.name, item }))
      ),
    [category]
  );

  const page = pages[pageIndex];
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= pages.length - 1;

  const share = () => {
    if (!page) return;
    const parts = [page.item.arabic, page.item.translation, page.item.reference].filter(Boolean);
    Share.share({ message: parts.join('\n\n') }).catch(() => {
      // User-dismissed share sheets reject on some platforms -- nothing to
      // recover from, just don't let it surface as an unhandled rejection.
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.headerTitle}>
            {page?.chapterName ?? category?.name ?? ''}
          </ThemedText>
          <Pressable onPress={share} hitSlop={8} style={styles.headerButton} disabled={!page}>
            <Ionicons name="share-outline" size={22} color={page ? theme.text : theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {(['display', 'audio'] as const).map((id) => (
            <Pressable key={id} onPress={() => setTab(id)} style={styles.tabButton}>
              <ThemedText
                type="smallBold"
                themeColor={tab === id ? 'primary' : 'textSecondary'}
                style={styles.tabLabel}>
                {id === 'display' ? 'Display' : 'Audio'}
              </ThemedText>
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: tab === id ? theme.primary : 'transparent' },
                ]}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {!page && <EmptyState icon="flower-outline" message="This category has no duas yet." />}

          {page && tab === 'display' && (
            <ScrollView contentContainerStyle={styles.content}>
              <ArabicText size="ayahCompact" style={styles.arabic}>
                {page.item.arabic}
              </ArabicText>
              <ThemedText themeColor="textSecondary" style={styles.translation}>
                {page.item.translation}
              </ThemedText>
              {page.item.reference && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.reference}>
                  {page.item.reference}
                </ThemedText>
              )}
            </ScrollView>
          )}

          {page && tab === 'audio' && (
            <EmptyState
              icon="musical-notes-outline"
              message="Audio recitation isn't available for this dua yet."
            />
          )}
        </View>

        {page && (
          <View style={[styles.pager, { borderTopColor: theme.border }]}>
            <Pressable
              onPress={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={atStart}
              hitSlop={8}>
              <Ionicons
                name="play-skip-back"
                size={22}
                color={atStart ? theme.textSecondary : theme.text}
              />
            </Pressable>
            <ThemedText type="small" themeColor="textSecondary">
              {pageIndex + 1} / {pages.length}
            </ThemedText>
            <Pressable
              onPress={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              disabled={atEnd}
              hitSlop={8}>
              <Ionicons
                name="play-skip-forward"
                size={22}
                color={atEnd ? theme.textSecondary : theme.text}
              />
            </Pressable>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  tabLabel: {
    paddingTop: Spacing.one,
  },
  tabIndicator: {
    height: 2,
    width: '60%',
    borderRadius: 1,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  arabic: {
    textAlign: 'right',
  },
  translation: {
    lineHeight: 24,
  },
  reference: {
    fontStyle: 'italic',
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
