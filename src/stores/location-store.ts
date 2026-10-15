import { create } from 'zustand';

/**
 * Client state only (no server data here) -- the user's chosen location
 * for prayer times/qibla, either a real GPS fix or a manually picked city
 * for when location permission is declined. Shared across the Prayer
 * Times and Qibla screens so picking a city once covers both.
 */
interface LocationState {
  latitude: number | null;
  longitude: number | null;
  source: 'gps' | 'manual' | null;
  /** Only set when source is 'manual' -- a GPS fix has no human-readable name. */
  label: string | null;
  /** Only set when source is 'manual' -- the picked city's flag emoji, for
   * the Prayers screen's flag+city location chip (the real Muslim Pro app
   * shows one). A GPS fix has no known country without reverse-geocoding
   * (not done here), so it stays null and the chip falls back to a plain
   * location-pin icon instead of guessing a flag. */
  flag: string | null;
  setLocation: (
    latitude: number,
    longitude: number,
    source: 'gps' | 'manual',
    label?: string,
    flag?: string
  ) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  source: null,
  label: null,
  flag: null,
  setLocation: (latitude, longitude, source, label, flag) =>
    set({ latitude, longitude, source, label: label ?? null, flag: flag ?? null }),
}));
