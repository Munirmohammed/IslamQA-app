import { Text, type TextProps } from 'react-native';

import { ArabicFonts, ArabicTypeScale, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ArabicTextProps = TextProps & {
  size?: keyof typeof ArabicTypeScale;
  bold?: boolean;
  themeColor?: ThemeColor;
};

/** Renders Quran/Arabic text with the correct font, RTL direction, and a
 * type scale sized for Uthmani script -- never reuse ThemedText for Quran
 * text, the Latin type scale reads too small/cramped for Arabic. */
export function ArabicText({ style, size = 'ayah', bold = false, themeColor, ...rest }: ArabicTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        {
          color: theme[themeColor ?? 'text'],
          fontFamily: bold ? ArabicFonts.quranBold : ArabicFonts.quran,
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
