import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const STORAGE_KEY = 'islamqa_daily_goals_v1';

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

interface Persisted {
  readingGoalAyahs: number;
  hifzGoalCards: number;
  hifzReviewedToday: number;
  lastActiveDate: string;
}

interface DailyGoalsState extends Persisted {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setTargets: (readingGoalAyahs: number, hifzGoalCards: number) => void;
  /** Called from useReviewCard()'s onSuccess (features/memorization/api.ts)
   * -- an automatic count of real SM-2 reviews done today, not a manual
   * self-report button like the AI Studio prototype this was ported from
   * used. Rolls over to 0 the first time it's touched on a new day. */
  recordHifzReview: () => void;
}

function persist(state: Persisted) {
  SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
    console.warn('Failed to persist daily goals:', error);
  });
}

function rolledOver(state: Persisted): Persisted {
  if (state.lastActiveDate === todayKey()) return state;
  return { ...state, hifzReviewedToday: 0, lastActiveDate: todayKey() };
}

export const useDailyGoalsStore = create<DailyGoalsState>((set, get) => ({
  readingGoalAyahs: 20,
  hifzGoalCards: 5,
  hifzReviewedToday: 0,
  lastActiveDate: todayKey(),
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = rolledOver(JSON.parse(raw) as Persisted);
        set({ ...parsed, isHydrated: true });
        if (parsed.lastActiveDate !== (JSON.parse(raw) as Persisted).lastActiveDate) persist(parsed);
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.warn('Failed to read persisted daily goals, using defaults:', error);
      set({ isHydrated: true });
    }
  },

  setTargets: (readingGoalAyahs, hifzGoalCards) => {
    const next = rolledOver({ ...get(), readingGoalAyahs, hifzGoalCards });
    set(next);
    persist(next);
  },

  recordHifzReview: () => {
    const current = rolledOver(get());
    const next = { ...current, hifzReviewedToday: current.hifzReviewedToday + 1 };
    set(next);
    persist(next);
  },
}));
