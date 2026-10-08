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
