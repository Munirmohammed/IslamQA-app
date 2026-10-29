/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useThemeModeStore } from '@/stores/theme-mode-store';

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

/** Always resolves to the dark (or AMOLED) palette, never the system's
 * light/dark preference -- this app has exactly one visual identity (the
 * dark teal Qalam look every real Muslim Pro reference screenshot and the
 * full approved design canvas used), not a system-driven light variant
 * nobody designed or asked for. Previously this followed
 * `useColorScheme()`, which silently rendered `Colors.light` -- a pale,
 * never-reviewed palette -- on any device whose OS appearance happened to
 * be set to light, which is exactly what made the real phone look like a
 * different, unfinished app next to every dark-mode web preview used to
 * verify changes during development. `Colors.light` itself is left in
 * place (not deleted) since `ReadingThemes` and other call sites may
 * still reference the `ThemeColor` shape it defines. */
export function useTheme() {
  const darkMode = useThemeModeStore((s) => s.mode);
  const theme = darkMode === 'amoled' ? 'amoled' : 'dark';
  const override = useContext(ReadingThemeOverrideContext);

  return override ? { ...Colors[theme], ...override } : Colors[theme];
}
