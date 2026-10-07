import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

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
 * see Backend Phase 1's Basmalah-splitting fix), translation, and a mic
 * shortcut into the Practice tab preset to check *this* ayah (Phase 2).
 * Tajweed coloring and the fuller long-press action menu (Explain /
 * Memorize / Share) are later phases layered onto this same component. */
export function AyahCard({ ayah }: AyahCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.numberBadge, { backgroundColor: theme.primaryMuted }]}>
          <ThemedText type="small" themeColor="primary" style={styles.numberText}>
            {ayah.ayah_number}
          </ThemedText>
        </View>

        <Link href={`/practice?surah=${ayah.surah_number}&ayah=${ayah.ayah_number}`} asChild>
          <Pressable hitSlop={8}>
            {({ pressed }) => (
              <View style={[styles.micBadge, { opacity: pressed ? 0.6 : 1 }]}>
                <ThemedText type="small" themeColor="primary">
                  🎙 Check my recitation
                </ThemedText>
              </View>
            )}
          </Pressable>
        </Link>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  micBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  basmalah: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  translation: {
    textAlign: 'left',
  },
});
