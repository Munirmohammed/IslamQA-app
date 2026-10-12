/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ThemeOverride {
  background: string;
  backgroundElement: string;
  text: string;
  textSecondary: string;
}

/** Lets a screen (the Quran reading view, via ReadingThemes) swap the
 * page/text colors every `useTheme()` call returns, without plumbing an
 * override through every component that calls it -- ThemedView, ThemedText,
 * and ArabicText all already call `useTheme()` internally, so wrapping a
 * subtree in this provider re-themes all of them for free. Brand colors
 * (primary, recitationHighlight, ...) are deliberately left untouched --
 * only the page's own background/text should change per reading theme. */
const ReadingThemeOverrideContext = createContext<ThemeOverride | null>(null);
export const ReadingThemeOverrideProvider = ReadingThemeOverrideContext.Provider;

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;
  const override = useContext(ReadingThemeOverrideContext);

  return override ? { ...Colors[theme], ...override } : Colors[theme];
}
