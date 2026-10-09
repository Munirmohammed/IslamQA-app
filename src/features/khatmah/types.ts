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
