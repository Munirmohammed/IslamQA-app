import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { JuzProgress, SurahProgress } from '@/features/memorization/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

/** The Hifz Garden: a juz "bed" of 30 buds (filled in as juz get
 * memorized) plus a per-surah leaf list, both driven entirely by
 * GET /memorization/progress -- no invented growth animation, just real
 * tracked/learned counts rendered as a garden metaphor. */
export function HifzGarden({
  surahs,
  juz,
}: {
  surahs: SurahProgress[];
  juz: JuzProgress[];
}) {
  const juzByNumber = new Map(juz.map((j) => [j.juz, j]));

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="smallBold">Juz garden</ThemedText>
        <View style={styles.budGrid}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
            <JuzBud key={juzNumber} juzNumber={juzNumber} progress={juzByNumber.get(juzNumber)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Surahs in progress</ThemedText>
        {surahs.map((surah) => (
          <SurahLeaf key={surah.surah_number} surah={surah} />
        ))}
      </View>
    </View>
  );
}

function JuzBud({ juzNumber, progress }: { juzNumber: number; progress: JuzProgress | undefined }) {
  const theme = useTheme();
  const fraction = progress ? progress.ayahs_learned / progress.total_ayahs : 0;
  const touched = !!progress && progress.ayahs_tracked > 0;

  const backgroundColor = !touched
    ? theme.backgroundElement
    : fraction >= 1
      ? theme.primary
      : withOpacity(theme.primary, 0.25 + 0.65 * fraction);

  return (
    <View style={[styles.bud, { backgroundColor, borderColor: theme.border }]}>
      <ThemedText
        type="small"
        themeColor={touched && fraction > 0.5 ? 'background' : 'textSecondary'}
        style={styles.budLabel}>
        {juzNumber}
      </ThemedText>
    </View>
  );
}

function SurahLeaf({ surah }: { surah: SurahProgress }) {
  const theme = useTheme();
  const fraction = surah.ayahs_learned / surah.total_ayahs;
  const trackedFraction = surah.ayahs_tracked / surah.total_ayahs;
  const bloomed = fraction >= 1;

  return (
    <View style={styles.leafRow}>
      <ThemedText style={styles.leafIcon}>{bloomed ? '🌸' : fraction > 0 ? '🌿' : '🌱'}</ThemedText>
      <View style={styles.leafBody}>
        <View style={styles.leafHeader}>
          <ThemedText type="small">{surah.surah_name_en}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {surah.ayahs_learned}/{surah.total_ayahs}
          </ThemedText>
        </View>
        <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, trackedFraction * 100)}%`, backgroundColor: theme.border },
            ]}
          />
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, fraction * 100)}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function withOpacity(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.three,
  },
  budGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  bud: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budLabel: {
    fontSize: 10,
  },
  leafRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  leafIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  leafBody: {
    flex: 1,
    gap: Spacing.half,
  },
  leafHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
});
