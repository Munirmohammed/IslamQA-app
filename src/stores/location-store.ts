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
  setLocation: (latitude: number, longitude: number, source: 'gps' | 'manual', label?: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  source: null,
  label: null,
  setLocation: (latitude, longitude, source, label) =>
    set({ latitude, longitude, source, label: label ?? null }),
}));
