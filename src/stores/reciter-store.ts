import { create } from 'zustand';

/**
 * Client state only (no server data here) -- the user's chosen reciter for
 * audio playback. In-memory only, same tradeoff as location-store.ts: resets
 * on app restart rather than needing a new persistence dependency for a
 * low-stakes preference.
 */
interface ReciterState {
  reciterId: number | null;
  reciterName: string | null;
  setReciter: (reciterId: number, reciterName: string) => void;
}

export const useReciterStore = create<ReciterState>((set) => ({
  reciterId: null,
  reciterName: null,
  setReciter: (reciterId, reciterName) => set({ reciterId, reciterName }),
}));
