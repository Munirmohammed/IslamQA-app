// LocalStorage service with full typed persistence

export interface HifzCard {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  textUthmani: string;
  translation: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string; // ISO string
  status: 'learning' | 'review' | 'mastered';
}

export interface KhatmahProgress {
  title: string;
  targetDays: number;
  startDate: string;
  completedAyahsCount: number;
  readSurahAyahs: Record<number, number[]>; // surah -> array of read ayah numbers
}

export interface DailyGoalHistoryItem {
  date: string; // YYYY-MM-DD
  readingAyahs: number;
  hifzCards: number;
  readingTarget: number;
  hifzTarget: number;
  achieved: boolean;
}

export interface DailyGoalTracker {
  readingGoalAyahs: number;
  readingCompletedAyahs: number;
  hifzGoalCards: number;
  hifzCompletedCards: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: DailyGoalHistoryItem[];
}

export type ThemeMode = 'deep-green' | 'amoled';

export interface AppState {
  themeMode: ThemeMode;
  streak: number;
  lastActiveDate: string;
  hasanat: number;
  selectedCity: string;
  reciterId: number;
  readingTheme: 'teal' | 'paper' | 'calm' | 'focus';
  fontSize: number;
  showTranslation: boolean;
  showTajweed: boolean;
  showWordByWord: boolean;
  khatmah: KhatmahProgress;
  hifzCards: HifzCard[];
  tasbihTotal: number;
  tasbihHistory: { date: string; count: number; dhikr: string }[];
  bookmarks: { surah: number; ayah: number; note?: string }[];
  dailyGoals: DailyGoalTracker;
}

const DEFAULT_STATE: AppState = {
  themeMode: 'deep-green',
  streak: 14,
  lastActiveDate: new Date().toISOString().split('T')[0],
  hasanat: 8040,
  selectedCity: 'Mecca',
  reciterId: 7,
  readingTheme: 'teal',
  fontSize: 26,
  showTranslation: true,
  showTajweed: true,
  showWordByWord: false,
  khatmah: {
    title: 'Ramadan Khatmah',
    targetDays: 30,
    startDate: new Date().toISOString(),
    completedAyahsCount: 142,
    readSurahAyahs: { 1: [1, 2, 3, 4, 5, 6, 7] },
  },
  hifzCards: [
    {
      surahNumber: 1,
      ayahNumber: 1,
      surahName: 'Al-Fatihah',
      textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      intervalDays: 12,
      repetitions: 6,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      status: 'mastered',
    },
    {
      surahNumber: 112,
      ayahNumber: 1,
      surahName: 'Al-Ikhlas',
      textUthmani: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      translation: 'Say, "He is Allah, [who is] One,',
      intervalDays: 6,
      repetitions: 3,
      easeFactor: 2.4,
      nextReviewDate: new Date().toISOString(),
      status: 'review',
    },
    {
      surahNumber: 114,
      ayahNumber: 1,
      surahName: 'An-Nas',
      textUthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
      translation: 'Say, "I seek refuge in the Lord of mankind,',
      intervalDays: 1,
      repetitions: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      status: 'learning',
    },
  ],
  tasbihTotal: 1240,
  tasbihHistory: [
    { date: new Date().toISOString().split('T')[0], count: 99, dhikr: 'SubhanAllah' },
  ],
  bookmarks: [{ surah: 1, ayah: 1, note: 'Daily recitation' }],
  dailyGoals: {
    readingGoalAyahs: 20,
    readingCompletedAyahs: 14,
    hifzGoalCards: 5,
    hifzCompletedCards: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    history: [
      {
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        readingAyahs: 25,
        hifzCards: 5,
        readingTarget: 20,
        hifzTarget: 5,
        achieved: true,
      },
      {
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        readingAyahs: 20,
        hifzCards: 6,
        readingTarget: 20,
        hifzTarget: 5,
        achieved: true,
      },
      {
        date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        readingAyahs: 22,
        hifzCards: 5,
        readingTarget: 20,
        hifzTarget: 5,
        achieved: true,
      },
    ],
  },
};

const STORAGE_KEY = 'qalam_islamic_app_state_v1';

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(DEFAULT_STATE);
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    const merged: AppState = {
      ...DEFAULT_STATE,
      ...parsed,
      dailyGoals: {
        ...DEFAULT_STATE.dailyGoals,
        ...(parsed.dailyGoals || {}),
      },
    };

    // Auto-rollover if user opens app on a new day
    const today = new Date().toISOString().split('T')[0];
    if (merged.dailyGoals.lastActiveDate !== today) {
      const prevDate = merged.dailyGoals.lastActiveDate;
      const readCount = merged.dailyGoals.readingCompletedAyahs;
      const hifzCount = merged.dailyGoals.hifzCompletedCards;
      const prevHistory = merged.dailyGoals.history || [];

      let updatedHistory = prevHistory;
      if ((readCount > 0 || hifzCount > 0) && !prevHistory.some((h) => h.date === prevDate)) {
        updatedHistory = [
          ...prevHistory.slice(-13),
          {
            date: prevDate,
            readingAyahs: readCount,
            hifzCards: hifzCount,
            readingTarget: merged.dailyGoals.readingGoalAyahs,
            hifzTarget: merged.dailyGoals.hifzGoalCards,
            achieved:
              readCount >= merged.dailyGoals.readingGoalAyahs &&
              hifzCount >= merged.dailyGoals.hifzGoalCards,
          },
        ];
      }

      merged.dailyGoals = {
        ...merged.dailyGoals,
        readingCompletedAyahs: 0,
        hifzCompletedCards: 0,
        lastActiveDate: today,
        history: updatedHistory,
      };
      saveAppState(merged);
    }

    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save app state to localStorage', err);
  }
}

// SM-2 Spaced Repetition Algorithm implementation
export function processSM2Review(
  card: HifzCard,
  grade: 'again' | 'hard' | 'good' | 'easy'
): HifzCard {
  let { intervalDays, repetitions, easeFactor } = card;

  // Grade numeric equivalents: again = 1, hard = 2, good = 4, easy = 5
  let gradeVal = 4;
  if (grade === 'again') gradeVal = 1;
  else if (grade === 'hard') gradeVal = 2;
  else if (grade === 'good') gradeVal = 4;
  else if (grade === 'easy') gradeVal = 5;

  if (gradeVal >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  // Adjust ease factor
  easeFactor = easeFactor + (0.1 - (5 - gradeVal) * (0.08 + (5 - gradeVal) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  const status: HifzCard['status'] =
    repetitions >= 5 ? 'mastered' : repetitions >= 2 ? 'review' : 'learning';

  return {
    ...card,
    intervalDays,
    repetitions,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
    status,
  };
}
