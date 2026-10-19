import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const STORAGE_KEY = 'islamqa_dark_theme_mode';

export type DarkThemeMode = 'green' | 'amoled';

/** Which dark-mode look to use -- Muslim Pro's deep teal ("green") or a
 * true-black AMOLED variant -- independent of the system light/dark
 * setting this app already follows (see useTheme()). Only takes effect
 * when the resolved scheme is dark; a user on a light system isn't shown
 * this choice. Persisted the same way notification-prefs-store persists
 * its own small preference: SecureStore, best-effort. */
interface ThemeModeState {
  mode: DarkThemeMode;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: () => void;
}

export const useThemeModeStore = create<ThemeModeState>((set, get) => ({
  mode: 'green',
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw === 'green' || raw === 'amoled') {
        set({ mode: raw, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.warn('Failed to read persisted theme mode, using default:', error);
      set({ isHydrated: true });
    }
  },

  toggle: () => {
    const next: DarkThemeMode = get().mode === 'green' ? 'amoled' : 'green';
    set({ mode: next });
    SecureStore.setItemAsync(STORAGE_KEY, next).catch((error) => {
      console.warn('Failed to persist theme mode:', error);
    });
  },
}));
