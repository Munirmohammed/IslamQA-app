// Mirrors app/api/v1/endpoints/quran.py's response models exactly.

export interface SurahSummary {
  surah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  surah_name_translation_en: string;
  revelation_type: string;
  ayah_count: number;
}

export interface Ayah {
  surah_number: number;
  ayah_number: number;
  global_ayah_number: number;
  juz: number;
  page: number;
  text_uthmani: string;
  text_simple: string;
  basmalah: string | null;
  translation_en: string;
  key: string;
}

export interface SurahDetail {
  surah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  surah_name_translation_en: string;
  revelation_type: string;
  ayahs: Ayah[];
}

export interface RandomAyah {
  surah_number: number;
  ayah_number: number;
  surah_name_en: string;
  text_uthmani: string;
  translation_en: string;
}

export interface WordByWord {
  position: number;
  text_uthmani: string;
  translation: string;
  transliteration: string | null;
}
