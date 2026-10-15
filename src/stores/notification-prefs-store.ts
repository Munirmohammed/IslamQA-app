import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { PrayerKey } from '@/lib/prayer-times';

const STORAGE_KEY = 'islamqa_prayer_notification_prefs';
const ALL_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Per-prayer-type local-notification preference (not tied to a specific
 * date -- "notify me at Fajr" is a standing preference the real Muslim Pro
 * bell icon represents, not a one-day setting), persisted the same way
 * auth-store persists tokens: SecureStore, best-effort, logged-out/default
 * state if the read or write fails rather than crashing the screen. */
interface NotificationPrefsState {
  /** Defaults to true for every prayer until the persisted value loads,
   * matching the real screenshot where most rows start with notifications
   * on. */
  enabled: Record<PrayerKey, boolean>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (key: PrayerKey) => void;
}

function defaultEnabled(): Record<PrayerKey, boolean> {
  return Object.fromEntries(ALL_KEYS.map((key) => [key, true])) as Record<PrayerKey, boolean>;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>((set, get) => ({
  enabled: defaultEnabled(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<PrayerKey, boolean>>;
        set({ enabled: { ...defaultEnabled(), ...parsed }, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.warn('Failed to read persisted notification prefs, using defaults:', error);
      set({ isHydrated: true });
    }
  },

  toggle: (key) => {
    const next = { ...get().enabled, [key]: !get().enabled[key] };
    set({ enabled: next });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)).catch((error) => {
      console.warn('Failed to persist notification prefs:', error);
    });
  },
}));
