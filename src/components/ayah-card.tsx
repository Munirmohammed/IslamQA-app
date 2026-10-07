import { StyleSheet, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { Ayah } from '@/features/quran/types';

interface AyahCardProps {
  ayah: Ayah;
}

/** A single ayah: Uthmani text (+ Basmalah, when this ayah carries one --
 * see Backend Phase 1's Basmalah-splitting fix) and its translation.
 * Read-only for F0 -- tajweed coloring, mistake highlighting, and the
 * long-press action menu (Explain / Memorize / Check recitation / Share)
 * are later phases layered onto this same component. */
export function AyahCard({ ayah }: AyahCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={[styles.numberBadge, { backgroundColor: theme.primaryMuted }]}>
        <ThemedText type="small" themeColor="primary" style={styles.numberText}>
          {ayah.ayah_number}
        </ThemedText>
      </View>

      {ayah.basmalah && (
        <ArabicText size="ayahCompact" style={styles.basmalah} themeColor="textSecondary">
          {ayah.basmalah}
        </ArabicText>
      )}

      <ArabicText>{ayah.text_uthmani}</ArabicText>

      <ThemedText themeColor="textSecondary" style={styles.translation}>
        {ayah.translation_en}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: '700',
  },
  basmalah: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  translation: {
    textAlign: 'left',
  },
});
