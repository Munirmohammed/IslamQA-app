// Mirrors app/api/v1/endpoints/gamification.py's response models.

export interface StreakResponse {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_verses_read: number;
  total_hasanat: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  current_streak: number;
  total_hasanat: number;
}

export interface LeaderboardResponse {
  metric: string;
  entries: LeaderboardEntry[];
}

export interface LogProgressInput {
  surah: number;
  ayah_from: number;
  ayah_to: number;
}

export interface DailyActivityEntry {
  date: string;
  verses_read: number;
  hasanat: number;
}

export interface HistoryResponse {
  days: DailyActivityEntry[];
}
