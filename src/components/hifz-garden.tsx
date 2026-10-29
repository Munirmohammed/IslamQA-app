import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';

import { Radius, Spacing } from '@/constants/theme';
import type { JuzProgress, SurahProgress } from '@/features/memorization/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type GrowthStage = 'seed' | 'sprout' | 'sapling' | 'bloomed';

function stageFor(fraction: number): GrowthStage {
  if (fraction >= 1) return 'bloomed';
  if (fraction >= 0.5) return 'sapling';
  if (fraction > 0) return 'sprout';
  return 'seed';
}

/** A small illustrated plant, not an emoji -- four real growth stages
 * (seed/sprout/sapling/bloomed) drawn with react-native-svg (already a
 * dependency elsewhere in the app), matching the design's garden mockup. */
export function PlantIcon({ stage, size = 28 }: { stage: GrowthStage; size?: number }) {
  const w = size;
  const h = size * 1.2;
  if (stage === 'seed') {
    return (
      <Svg width={w} height={h} viewBox="0 0 24 29">
        <Rect x="10" y="22" width="4" height="6" fill="#6B4A2F" />
        <Ellipse cx="12" cy="14" rx="2.2" ry="9" fill="#2E8B5E" />
      </Svg>
    );
  }
  if (stage === 'sprout') {
    return (
      <Svg width={w} height={h} viewBox="0 0 24 29">
        <Rect x="10" y="20" width="4" height="7" fill="#6B4A2F" />
        <Ellipse cx="12" cy="11" rx="3" ry="11" fill="#2E8B5E" />
      </Svg>
    );
  }
  if (stage === 'sapling') {
    return (
      <Svg width={w} height={h} viewBox="0 0 34 36">
        <Rect x="14" y="27" width="6" height="8" fill="#6B4A2F" />
        <Ellipse cx="17" cy="16" rx="12" ry="16" fill="#19C97E" />
      </Svg>
    );
  }
  return (
    <Svg width={w} height={h} viewBox="0 0 46 43">
      <Rect x="19" y="34" width="8" height="9" fill="#6B4A2F" />
      <Circle cx="23" cy="18" r="18" fill="#16B873" />
      <Circle cx="23" cy="18" r="13" fill="#1FD182" />
      <Circle cx="14" cy="8" r="2" fill="#E3B869" />
      <Circle cx="30" cy="22" r="2" fill="#E3B869" />
    </Svg>
  );
}

const STAGE_LABEL: Record<GrowthStage, string> = {
  seed: 'Seed',
  sprout: 'Sprout',
  sapling: 'Sapling',
  bloomed: 'Bloomed',
};

/** A small illustrated garden strip -- a handful of real planted surahs at
 * their actual growth stage, sitting on a soil band. Purely decorative
 * (the real data is the Juz grid and surah rows below it), capped to the
 * surahs actually being grown so it never shows more plants than exist. */
export function GardenScene({ surahs }: { surahs: SurahProgress[] }) {
  const theme = useTheme();
  const planted = surahs.slice(0, 5);

  return (
    <View style={[styles.scene, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.sceneRow}>
        {planted.map((surah) => (
          <PlantIcon
            key={surah.surah_number}
            stage={stageFor(surah.ayahs_learned / surah.total_ayahs)}
            size={surah.ayahs_learned / surah.total_ayahs >= 1 ? 42 : 28}
          />
        ))}
      </View>
      <View style={[styles.sceneBadge, { backgroundColor: 'rgba(0,30,26,0.55)' }]}>
        <ThemedText type="smallBold">
          {surahs.length} surah{surahs.length === 1 ? '' : 's'} growing
        </ThemedText>
      </View>
    </View>
  );
}

export function GardenLegend() {
  const theme = useTheme();
  return (
    <View style={styles.legendRow}>
      <LegendDot color="#2E8B5E" label="Sprout" />
      <LegendDot color="#19C97E" label="Sapling" />
      <LegendDot color={theme.primary} label="Bloomed" />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textFaint">
        {label}
      </ThemedText>
    </View>
  );
}

/** The Hifz Garden: a juz "bed" of 30 buds (filled in as juz get
 * memorized) plus a per-surah plant-growth list, both driven entirely by
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
      <GardenScene surahs={surahs} />
      <GardenLegend />

      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          Your Surahs
        </ThemedText>
        {surahs.map((surah) => (
          <SurahRow key={surah.surah_number} surah={surah} />
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          Juz Overview
        </ThemedText>
        <View style={styles.budGrid}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
            <JuzBud key={juzNumber} juzNumber={juzNumber} progress={juzByNumber.get(juzNumber)} />
          ))}
        </View>
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

function SurahRow({ surah }: { surah: SurahProgress }) {
  const fraction = surah.ayahs_learned / surah.total_ayahs;
  const stage = stageFor(fraction);

  return (
    <ThemedView type="backgroundElement" style={styles.surahRow}>
      <PlantIcon stage={stage} size={26} />
      <View style={styles.surahBody}>
        <ThemedText type="small" style={styles.surahName}>
          {surah.surah_name_en}
        </ThemedText>
        <ThemedText type="small" themeColor="textFaint">
          {surah.ayahs_learned} of {surah.total_ayahs} ayahs &middot; {STAGE_LABEL[stage]}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor={fraction >= 1 ? 'primary' : 'textSecondary'}>
        {Math.round(fraction * 100)}%
      </ThemedText>
    </ThemedView>
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
  scene: {
    height: 150,
    borderRadius: Radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: Spacing.three,
  },
  sceneBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  section: {
    gap: Spacing.three,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  surahBody: {
    flex: 1,
    gap: 2,
  },
  surahName: {
    fontWeight: '700',
  },
});
