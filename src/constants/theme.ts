/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1F1C',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#0F6B4F',
    primaryMuted: '#E3F1EC',
    accent: '#C9A24B',
    border: '#E2E4E1',
  },
  dark: {
    text: '#F2F3F1',
    background: '#0B0F0D',
    backgroundElement: '#161B18',
    backgroundSelected: '#212825',
    textSecondary: '#9AA39D',
    primary: '#2FA67D',
    primaryMuted: '#12241D',
    accent: '#D8B463',
    border: '#242B27',
  },
} as const;

/** Arabic (Uthmani Quran) type scale -- deliberately separate from the
 * Latin type scale: Arabic script needs larger sizes and more line-height
 * to read comfortably, and tajweed-colored spans (Backend Phase 5) need
 * room to breathe. */
export const ArabicFonts = {
  // Noto Naskh Arabic: reliable, broad Unicode coverage (diacritics,
  // Quranic marks), available as a normal Google Font. A dedicated Uthmani
  // script font (e.g. KFGQPC Uthmanic) reads more authentically but isn't
  // on Google Fonts and needs manual font-file bundling -- a follow-up
  // polish item, not a Phase F0 blocker.
  quran: 'NotoNaskhArabic_400Regular',
  quranBold: 'NotoNaskhArabic_700Bold',
} as const;

export const ArabicTypeScale = {
  ayah: { fontSize: 26, lineHeight: 52 },
  ayahCompact: { fontSize: 22, lineHeight: 44 },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
