import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { SurahSummary } from '@/features/quran/types';

interface SurahListItemProps {
  surah: SurahSummary;
}

export function SurahListItem({ surah }: SurahListItemProps) {
  const theme = useTheme();

  return (
    <Link href={`/read/${surah.surah_number}`} asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView
            type="backgroundElement"
            style={[styles.container, pressed && { backgroundColor: theme.backgroundSelected }]}>
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
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
