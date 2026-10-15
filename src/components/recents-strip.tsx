import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { formatRecentTimestamp } from '@/lib/format-relative-time';
import { useTheme } from '@/hooks/use-theme';

import type { RecentSurahItem } from '@/features/khatmah/types';
import type { SurahSummary } from '@/features/quran/types';

interface RecentsStripProps {
  items: RecentSurahItem[];
  surahsByNumber: ReadonlyMap<number, SurahSummary>;
}

/** Muslim Pro's Quran tab opens on a horizontal-scroll "Recents" strip --
 * each entry a calligraphy-style badge + aya reference + a relative
 * timestamp ("Just now" / "2d" / "03/12/25"). Backed by real per-surah
 * read_at data from GET /khatmah/recent-surahs (see that endpoint's
 * docstring for what last_ayah_number does and doesn't mean) -- this
 * never fabricates extra entries beyond what the user actually read. */
export function RecentsStrip({ items, surahsByNumber }: RecentsStripProps) {
  const theme = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Recents
        </ThemedText>
        {/* Real device screenshot shows a small (i) next to "Recents" --
            not a dead decoration: it explains where this list comes from,
            which is genuinely non-obvious (it's driven by actual reading
            activity, not a fixed/editable list). A real one-line
            explanation on tap, not a fabricated link to a screen that
            doesn't exist. */}
        <Pressable
          hitSlop={8}
          onPress={() =>
            Alert.alert('Recents', 'Automatically tracks the suras you’ve recently read, most recent first.')
          }>
          <Ionicons name="information-circle-outline" size={15} color={theme.textSecondary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => {
          const surah = surahsByNumber.get(item.surah_number);
          if (!surah) return null;
          return (
            <RecentCard
              key={item.surah_number}
              item={item}
              surah={surah}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function RecentCard({ item, surah }: { item: RecentSurahItem; surah: SurahSummary }) {
  const theme = useTheme();
  return (
    <Link href={`/quran/${surah.surah_number}`} asChild>
      <Pressable style={styles.card}>
        {({ pressed }) => (
          <View style={[styles.cardInner, pressed && { opacity: 0.7 }]}>
            <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
              <ArabicText size="badgeLarge" font="badge" bold themeColor="primary" numberOfLines={1}>
                {surah.surah_name_ar}
              </ArabicText>
            </View>
            <ThemedText type="small" numberOfLines={1}>
              {surah.surah_name_en}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              Aya {item.last_ayah_number}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {formatRecentTimestamp(item.last_read_at)}
            </ThemedText>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  // No horizontal padding here -- this sits inside the Quran list's own
  // FlashList as a ListHeaderComponent, which already applies
  // contentContainerStyle's horizontal padding around everything in it
  // (this strip and the sura rows below alike), so adding it again here
  // would double-inset just this section relative to the list.
  section: {
    paddingTop: Spacing.three,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  row: {
    gap: Spacing.three,
  },
  card: {
    width: 92,
  },
  cardInner: {
    gap: 2,
  },
  // Roughly square, noticeably bigger than a list row's inline name --
  // matches the real screenshot's Recents badge proportions (a list row's
  // badge-size Arabic name is a much smaller accent next to the English
  // text, this one is the card's dominant visual element).
  badge: {
    width: 76,
    height: 72,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
});
