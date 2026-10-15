import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useDownloadSurah, useIsSurahDownloaded, useRemoveDownloadedSurah } from '@/features/quran/api';
import { useTheme } from '@/hooks/use-theme';

import type { SurahSummary } from '@/features/quran/types';

interface SurahListItemProps {
  surah: SurahSummary;
}

export function SurahListItem({ surah }: SurahListItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <Link href={`/quran/${surah.surah_number}`} asChild>
        <Pressable style={styles.navArea}>
          {({ pressed }) => (
            <View
              style={[
                styles.navAreaInner,
                pressed && { backgroundColor: theme.backgroundSelected },
              ]}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.number}>
                {surah.surah_number}
              </ThemedText>

              {/* A real device screenshot of Muslim Pro's Quran tab (5x
                  zoomed, not eyeballed at thumbnail size) shows no
                  badge/box around each row's Arabic sura name at all --
                  just the name itself, inline, in a calligraphic
                  typeface (see ArabicText's `font="badge"` / the
                  ArabicFonts.badge comment in constants/theme.ts for the
                  real, open-licensed font this uses and why there's no
                  geometric "seal" artwork here, real or fabricated). No
                  tinted container here on purpose, to match. */}
              <ArabicText size="badge" font="badge" themeColor="text" numberOfLines={1} style={styles.arabicName}>
                {surah.surah_name_ar}
              </ArabicText>

              <View style={styles.textColumn}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {surah.surah_name_en}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {surah.surah_name_translation_en}
                </ThemedText>
              </View>
            </View>
          )}
        </Pressable>
      </Link>

      {/* A sibling of the Link's Pressable, not nested inside it --
          `stopPropagation()` on a nested Pressable didn't reliably stop
          this from also triggering the row's navigation (confirmed:
          tapping download opened the surah instead), so this avoids the
          ambiguity structurally instead of fighting event propagation. */}
      <DownloadBadge surahNumber={surah.surah_number} />
    </ThemedView>
  );
}

function DownloadBadge({ surahNumber }: { surahNumber: number }) {
  const theme = useTheme();
  const isDownloaded = useIsSurahDownloaded(surahNumber);
  const download = useDownloadSurah();
  const remove = useRemoveDownloadedSurah();

  if (download.isPending) {
    return <ActivityIndicator size="small" color={theme.textSecondary} style={styles.downloadBadge} />;
  }

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        if (isDownloaded) {
          remove.mutate(surahNumber);
        } else {
          download.mutate(surahNumber);
        }
      }}
      style={styles.downloadBadge}>
      <Ionicons
        name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
        size={20}
        color={isDownloaded ? theme.primary : theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  navArea: {
    flex: 1,
  },
  navAreaInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.three,
  },
  downloadBadge: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Plain number, not circled -- matches the real screenshot (no chip/
  // circle around the row index). Fixed width so every row's Arabic name
  // and English text line up in a column regardless of 1 vs 2 digits.
  number: {
    width: 22,
    textAlign: 'center',
  },
  // No background/border -- the real screenshot has no badge box around
  // a list row's Arabic name, just the calligraphic text itself sitting
  // on the row (unlike the Recents card, which does get a tinted box).
  arabicName: {
    minWidth: 56,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
