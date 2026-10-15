import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AZKAR_CATEGORIES, type AzkarCategory } from '@/lib/azkar-data';

/** A real phone screenshot of Muslim Pro's live Duas screen (not Play
 * Store marketing art, which is what an earlier pass here mistakenly
 * relied on) shows every category card -- the "Daily Remembrances" hero
 * and each "Hisnul Muslim" card -- using a distinct real photograph as
 * its background, not a flat icon tile. This app has no image pipeline
 * or bundled photo assets for azkar categories, so these are genuine,
 * freely-licensed photos (Unsplash License: free for commercial and
 * noncommercial use) referenced by their permanent per-photo CDN URL --
 * the same stable `images.unsplash.com/photo-<id>` links Unsplash's own
 * API returns -- rather than a bundled asset, since there's no build
 * step here to download/optimize/ship them as local files yet. Each one
 * was hand-picked and visually checked against its category (not
 * guessed and left unverified): a Masjid an-Nabawi sunset for Morning &
 * Evening, a real family moment for Home & Family, a plated meal for
 * Food & Drink, a lone figure cresting a summit for Joy & Distress, a
 * jetliner window at sunset for Travel, a silhouette with palms raised
 * in dua for Prayer, a sunlit mushaf for Praising Allah, the Kaaba's
 * kiswah door for Hajj & Umrah, a handshake for Good Etiquette, misty
 * peaks for Nature, and clinical scrubs for Sickness & Death. */
const CATEGORY_PHOTO_IDS: Record<string, string> = {
  'Morning & Evening': '1591604129939-f1efa4d9f7fa',
  'Home & Family': '1609220136736-443140cffec6',
  'Food & Drink': '1504674900247-0877df9cc836',
  'Joy & Distress': '1519834785169-98be25ec3f84',
  Travel: '1488085061387-422e29b40080',
  Prayer: '1506126613408-eca07ce68773',
  'Praising Allah': '1609599006353-e629aaabfeae',
  'Hajj & Umrah': '1564769625905-50e93615e769',
  'Good Etiquette': '1521791136064-7986c2920216',
  Nature: '1506905925346-21bda4d32df4',
  'Sickness & Death': '1527613426441-4da17471b66d',
};

function categoryPhotoUrl(categoryName: string, width: number): string {
  const id = CATEGORY_PHOTO_IDS[categoryName];
  // Falls back to the Nature photo rather than a broken image if a
  // category is ever added to the data file without a matching entry
  // above -- a muted landscape reads fine as a generic placeholder.
  const safeId = id ?? CATEGORY_PHOTO_IDS.Nature;
  return `https://images.unsplash.com/photo-${safeId}?auto=format&fit=crop&w=${width}&q=75`;
}

function matchesQuery(category: AzkarCategory, query: string): boolean {
  if (category.name.toLowerCase().includes(query)) return true;
  return category.chapters.some((chapter) => chapter.name.toLowerCase().includes(query));
}

/** Muslim Pro's real "Hisnul Muslim" quick-access icon has no app screen
 * of its own to jump to here -- it's just the section already on this
 * page -- so it scrolls to that section instead of a dead link. Tasbih
 * is now a real, built screen (`/more/tasbih`) and links there directly.
 * Bookmarks is still a real Muslim Pro feature this app doesn't have
 * built yet (no saved-dua storage); rather than wire it to a route that
 * doesn't exist or silently do nothing, it says so. */
function announceUnbuilt(feature: string) {
  Alert.alert(feature, `${feature} isn't built yet -- coming in a future update.`);
}

export default function AzkarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const hisnulMuslimY = useRef(0);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim().toLowerCase();
  const searching = trimmedQuery.length > 0;

  const indexed = AZKAR_CATEGORIES.map((category, index) => ({ category, index }));
  const searchResults = searching ? indexed.filter(({ category }) => matchesQuery(category, trimmedQuery)) : [];

  // Muslim Pro's "Daily Remembrances" hero card is Al-Ma'thurat -- the
  // classic combined morning-and-evening remembrance collection. This
  // app's data doesn't have that as a separately-compiled book, but it
  // does have the real "Morning & Evening" category that collection
  // draws from, so the hero card surfaces that real category and its
  // real chapter count instead of inventing a category/count that isn't
  // backed by actual content.
  const heroEntry = indexed.find(({ category }) => category.name === 'Morning & Evening') ?? indexed[0];
  const restEntries = indexed.filter((entry) => entry.index !== heroEntry.index);

  const scrollToHisnulMuslim = () => {
    scrollRef.current?.scrollTo({ y: Math.max(hisnulMuslimY.current - Spacing.four, 0), animated: true });
  };

  const onHisnulMuslimLayout = (event: LayoutChangeEvent) => {
    hisnulMuslimY.current = event.nativeEvent.layout.y;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ThemedView type="backgroundElement" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </ThemedView>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Duas
          </ThemedText>
          <Pressable onPress={() => announceUnbuilt('Bookmarks')} hitSlop={8}>
            <ThemedView type="backgroundElement" style={styles.iconCircle}>
              <Ionicons name="bookmark-outline" size={18} color={theme.text} />
            </ThemedView>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <ThemedView type="backgroundElement" style={styles.searchBar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="When sick..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              returnKeyType="search"
            />
            <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
          </ThemedView>

          {searching ? (
            <View style={styles.resultsList}>
              {searchResults.length === 0 && (
                <EmptyState icon="search-outline" message={`No duas found for "${query}".`} />
              )}
              {searchResults.map(({ category, index }) => (
                <Link
                  key={category.name}
                  href={{ pathname: '/more/azkar-category', params: { index } }}
                  asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <ThemedView
                        type="backgroundElement"
                        style={[styles.resultRow, pressed && styles.pressed]}>
                        <Image
                          source={{ uri: categoryPhotoUrl(category.name, 160) }}
                          style={styles.resultThumb}
                          contentFit="cover"
                        />
                        <View style={styles.resultText}>
                          <ThemedText type="smallBold">{category.name}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {category.chapters.length} chapter{category.chapters.length === 1 ? '' : 's'}
                          </ThemedText>
                        </View>
                      </ThemedView>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : (
            <>
              <ThemedView type="backgroundElement" style={styles.quickAccessCard}>
                <Pressable onPress={() => announceUnbuilt('Bookmarks')} style={styles.quickAccessItem}>
                  <Ionicons name="bookmark-outline" size={22} color={theme.primary} />
                  <ThemedText type="small" style={styles.quickAccessLabel} numberOfLines={1}>
                    Bookmarks
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={scrollToHisnulMuslim}
                  style={[styles.quickAccessItem, styles.quickAccessDivider, { borderLeftColor: theme.border }]}>
                  <Ionicons name="book-outline" size={22} color={theme.primary} />
                  <ThemedText type="small" style={styles.quickAccessLabel} numberOfLines={1}>
                    Hisnul Muslim
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/more/tasbih')}
                  style={[styles.quickAccessItem, styles.quickAccessDivider, { borderLeftColor: theme.border }]}>
                  <Ionicons name="disc-outline" size={22} color={theme.primary} />
                  <ThemedText type="small" style={styles.quickAccessLabel} numberOfLines={1}>
                    Tasbih
                  </ThemedText>
                </Pressable>
              </ThemedView>

              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Daily Remembrances
              </ThemedText>
              <Link
                href={{ pathname: '/more/azkar-category', params: { index: heroEntry.index } }}
                asChild>
                <Pressable>
                  {({ pressed }) => (
                    <View style={[styles.heroCard, pressed && styles.pressed]}>
                      <Image
                        source={{ uri: categoryPhotoUrl(heroEntry.category.name, 900) }}
                        style={styles.heroImage}
                        contentFit="cover"
                      />
                      <ThemedText type="smallBold" style={styles.cardTitle}>
                        {heroEntry.category.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {heroEntry.category.chapters.length} chapters
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              </Link>

              <View onLayout={onHisnulMuslimLayout}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Hisnul Muslim
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hScroll}>
                {restEntries.map(({ category, index }) => (
                  <Link
                    key={category.name}
                    href={{ pathname: '/more/azkar-category', params: { index } }}
                    asChild>
                    <Pressable style={styles.hCardWrapper}>
                      {({ pressed }) => (
                        <View style={[styles.hCard, pressed && styles.pressed]}>
                          <Image
                            source={{ uri: categoryPhotoUrl(category.name, 500) }}
                            style={styles.hCardImage}
                            contentFit="cover"
                          />
                          <ThemedText type="smallBold" numberOfLines={1} style={styles.cardTitle}>
                            {category.name}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {category.chapters.length} chapters
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ))}
              </ScrollView>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: 18,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  quickAccessCard: {
    flexDirection: 'row',
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  quickAccessLabel: {
    textAlign: 'center',
  },
  quickAccessDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 18,
  },
  heroCard: {
    gap: Spacing.one,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Radius.card,
  },
  cardTitle: {
    marginTop: Spacing.two,
  },
  hScroll: {
    gap: Spacing.three,
  },
  hCardWrapper: {
    width: 180,
  },
  hCard: {
    gap: Spacing.one,
  },
  hCardImage: {
    width: '100%',
    height: 130,
    borderRadius: Radius.card,
  },
  resultsList: {
    gap: Spacing.three,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.two,
  },
  resultThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.card,
  },
  resultText: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
