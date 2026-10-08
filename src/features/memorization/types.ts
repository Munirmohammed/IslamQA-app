// Mirrors app/api/v1/endpoints/memorization.py's response models.

export interface CardResponse {
  surah_number: number;
  ayah_number: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
}

export interface DueCard extends CardResponse {
  text_uthmani: string;
  translation_en: string;
}

export interface AddCardsInput {
  surah: number;
  ayah_from: number;
  ayah_to: number;
}

export interface ReviewCardInput {
  surah: number;
  ayah: number;
  quality: number;
}

export interface SimilarAyah {
  surah_number: number;
  ayah_number: number;
  key: string;
  text_uthmani: string;
  translation_en: string;
}

export interface SimilarAyahsResponse {
  surah: number;
  ayah: number;
  similar: SimilarAyah[];
}

export interface SurahProgress {
  surah_number: number;
  surah_name_en: string;
  total_ayahs: number;
  ayahs_tracked: number;
  ayahs_learned: number;
}

export interface JuzProgress {
  juz: number;
  total_ayahs: number;
  ayahs_tracked: number;
  ayahs_learned: number;
}

export interface ProgressResponse {
  surahs: SurahProgress[];
  juz: JuzProgress[];
}
