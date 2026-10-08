// Mirrors app/api/v1/endpoints/tafsir.py's response models.

export interface TafsirAyahResponse {
  surah: number;
  ayah: number;
  ayah_from: number;
  ayah_to: number;
  text_html: string;
  text_plain: string;
}

export interface TafsirSearchResult {
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  text_html: string;
  text_plain: string;
  fused_score: number;
}

export interface TafsirSearchResponse {
  query: string;
  total_results: number;
  results: TafsirSearchResult[];
}
