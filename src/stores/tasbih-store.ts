import { create } from 'zustand';

import { DHIKR_PHRASES } from '@/lib/tasbih-data';

/**
 * Client state only (no server data here) -- the Tasbih counter's current
 * tally, loop, selected dhikr, and loop-size target. In-memory only, same
 * tradeoff as reciter-store.ts/location-store.ts: resets on app restart
 * rather than needing a new persistence dependency for a low-stakes
 * preference. Progress *does* survive navigating away and back within a
 * session, which is the behavior that actually matters for a counter.
 */
export type BeadColor = 'green' | 'rose' | 'turquoise' | 'amethyst' | 'pearl' | 'onyx';

interface TasbihState {
  dhikrId: string;
  target: number;
  count: number;
  loopCount: number;
  hapticsEnabled: boolean;
  beadColor: BeadColor;
  increment: () => void;
  reset: () => void;
  setDhikr: (dhikrId: string) => void;
  setTarget: (target: number) => void;
  toggleHaptics: () => void;
  setBeadColor: (color: BeadColor) => void;
}

export const useTasbihStore = create<TasbihState>((set) => ({
  dhikrId: DHIKR_PHRASES[0].id,
  target: DHIKR_PHRASES[0].defaultTarget,
  count: 0,
  loopCount: 0,
  hapticsEnabled: true,
  beadColor: 'green',
  increment: () =>
    set((state) => {
      const next = state.count + 1;
      // Wraps into a new loop the moment a full round completes, rather than
      // sitting at "33/33" waiting for a second tap -- matches the real
      // app's "Loop 1" -> "Loop 2" header incrementing as soon as the ring
      // of beads closes.
      if (next >= state.target) {
        return { count: 0, loopCount: state.loopCount + 1 };
      }
      return { count: next };
    }),
  reset: () => set({ count: 0, loopCount: 0 }),
  // Changing dhikr or target mid-count would otherwise leave a stale tally
  // counted against a phrase/loop-size that's no longer selected -- starts
  // fresh instead, same as picking a different category resets azkar-category's reader.
  setDhikr: (dhikrId) => set({ dhikrId, count: 0, loopCount: 0 }),
  setTarget: (target) => set({ target, count: 0, loopCount: 0 }),
  toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
  setBeadColor: (beadColor) => set({ beadColor }),
}));
