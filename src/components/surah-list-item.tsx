import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
              <View style={[styles.numberBadge, { borderColor: theme.primary }]}>
                <ThemedText type="smallBold" themeColor="primary">
                  {surah.surah_number}
                </ThemedText>
              </View>

              <View style={styles.textColumn}>
                <ThemedText type="smallBold">{surah.surah_name_en}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {surah.surah_name_translation_en} · {surah.ayah_count} ayahs ·{' '}
                  {surah.revelation_type}
                </ThemedText>
              </View>

              <ArabicText size="ayahCompact">{surah.surah_name_ar}</ArabicText>
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
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  navArea: {
    flex: 1,
  },
  navAreaInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.three,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBadge: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
