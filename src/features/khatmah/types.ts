// Mirrors app/api/v1/endpoints/khatmah.py's KhatmahProgressResponse.

export interface KhatmahProgress {
  khatmah_id: string;
  started_at: string;
  completed_at: string | null;
  ayahs_read: number;
  total_ayahs: number;
  percent_complete: number;
  last_surah: number | null;
  last_ayah: number | null;
  last_surah_name_en: string | null;
}

export interface MarkAyahsReadInput {
  surah: number;
  ayah_from: number;
  ayah_to: number;
}

export interface RecentSurahItem {
  surah_number: number;
  // The highest ayah_number ever recorded as read for this surah -- in
  // practice its final ayah, since mark-read always marks a surah's whole
  // range at once (see [surah].tsx's open effect). A coarse "this surah
  // was opened" signal, not a scroll-accurate reading position.
  last_ayah_number: number;
  last_read_at: string;
}

export interface RecentSurahsResponse {
  items: RecentSurahItem[];
}
