import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { BRAND_COLORS, QALAM_MARK } from '@/constants/brand-mark';
import { ArabicFonts } from '@/constants/theme';

const EMERALD = BRAND_COLORS.emerald;
const GOLD = BRAND_COLORS.gold;
const CREAM = BRAND_COLORS.cream;

export interface ShareableAyahCardProps {
  textUthmani: string;
  translationEn: string;
  surahNameEn: string;
  surahNumber: number;
  ayahNumber: number;
}

/**
 * The branded, Instagram-story-shaped (9:16) image every "Share this ayah"
 * button renders off-screen and captures via `captureRef` (see
 * useShareAyah). Deliberately hardcodes the Qalam brand palette rather than
 * using ThemedText/ThemedView -- this becomes a static image handed to
 * someone else's camera roll, so it must look the same regardless of the
 * *viewer's* (or even the sharer's) light/dark app setting, not adapt to
 * either.
 */
export const ShareableAyahCard = forwardRef<View, ShareableAyahCardProps>(
  ({ textUthmani, translationEn, surahNameEn, surahNumber, ayahNumber }, ref) => {
    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        <View style={styles.content}>
          <Text style={styles.arabic}>{textUthmani}</Text>
          <View style={styles.rule} />
          <Text style={styles.translation}>{translationEn}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.reference}>
            {surahNameEn} {surahNumber}:{ayahNumber}
          </Text>
          <View style={styles.brandRow}>
            <Svg width={24} height={24} viewBox={QALAM_MARK.viewBox}>
              <Path
                d={QALAM_MARK.swashD}
                fill="none"
                stroke={EMERALD}
                strokeWidth={110}
                strokeLinecap="round"
              />
              <Circle cx={QALAM_MARK.dotCx} cy={QALAM_MARK.dotCy} r={QALAM_MARK.dotR * 2} fill={GOLD} />
            </Svg>
            <Text style={styles.brandEnglish}>Qalam</Text>
          </View>
        </View>
      </View>
    );
  }
);
ShareableAyahCard.displayName = 'ShareableAyahCard';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640; // 9:16, Instagram-story shaped

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: CREAM,
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  arabic: {
    fontFamily: ArabicFonts.quranBold,
    fontSize: 30,
    lineHeight: 56,
    color: EMERALD,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rule: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    alignSelf: 'center',
  },
  translation: {
    fontSize: 17,
    lineHeight: 26,
    color: '#4A4F49',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  reference: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8F87',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandEnglish: {
    fontSize: 13,
    fontStyle: 'italic',
    color: EMERALD,
  },
});
