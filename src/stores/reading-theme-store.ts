import { create } from 'zustand';

import type { ReadingThemeId } from '@/constants/theme';

/**
 * Client state only -- the user's chosen Mushaf reading-screen color theme
 * (Original/Paper/Calm/Focus/Quiet, or 'system' to just use the app's own
 * light/dark theme). In-memory only, same tradeoff as reciter-store.ts:
 * resets on app restart rather than needing a new persistence dependency
 * for a low-stakes preference.
 */
interface ReadingThemeState {
  themeId: ReadingThemeId;
  setThemeId: (themeId: ReadingThemeId) => void;
}

export const useReadingThemeStore = create<ReadingThemeState>((set) => ({
  themeId: 'system',
  setThemeId: (themeId) => set({ themeId }),
}));
