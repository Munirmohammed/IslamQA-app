// Mirrors app/api/v1/endpoints/recitation.py's response model.

export interface Mistake {
  type: 'incorrect' | 'missed' | 'extra';
  expected: string;
  recited: string;
  position: number;
}

export interface RecitationCheckResult {
  transcript: string;
  surah_number: number;
  surah_name_en: string;
  ayah_number: number;
  key: string;
  text_uthmani: string;
  translation_en: string;
  mistakes: Mistake[];
  is_correct: boolean;
}

export interface RecitationCheckInput {
  audioUri: string;
  /** Omit both to use "Tasmeea" find-mode: transcribe, then search for the
   * matching ayah server-side, instead of checking against a known one. */
  surah?: number;
  ayah?: number;
}
