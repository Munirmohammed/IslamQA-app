import { Text, type TextProps } from 'react-native';

import { ArabicFonts, ArabicTypeScale, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ArabicTextProps = TextProps & {
  size?: keyof typeof ArabicTypeScale;
  bold?: boolean;
  themeColor?: ThemeColor;
  /** 'quran' (default) is the Uthmani-script Naskh font for actual
   * ayah/Mushaf text. 'badge' is the decorative calligraphic cut used
   * only for sura-name badges (SurahListItem, RecentsStrip) -- see
   * ArabicFonts.badge's own comment in constants/theme.ts for why that's
   * a separate, real typeface rather than the reading font reused. */
  font?: 'quran' | 'badge';
};

const FONT_FAMILIES = {
  quran: { regular: ArabicFonts.quran, bold: ArabicFonts.quranBold },
  badge: { regular: ArabicFonts.badge, bold: ArabicFonts.badgeBold },
} as const;

/** Renders Quran/Arabic text with the correct font, RTL direction, and a
 * type scale sized for Uthmani script -- never reuse ThemedText for Quran
 * text, the Latin type scale reads too small/cramped for Arabic. */
export function ArabicText({ style, size = 'ayah', bold = false, themeColor, font = 'quran', ...rest }: ArabicTextProps) {
  const theme = useTheme();
  const family = FONT_FAMILIES[font];

  return (
    <Text
      style={[
        {
          color: theme[themeColor ?? 'text'],
          fontFamily: bold ? family.bold : family.regular,
          writingDirection: 'rtl',
          textAlign: 'right',
        },
        ArabicTypeScale[size],
        style,
      ]}
      {...rest}
    />
  );
}
