import azkarJson from '@/data/azkar.json';

export interface AzkarItem {
  arabic: string;
  translation: string;
  reference: string;
}

export interface AzkarChapter {
  name: string;
  items: AzkarItem[];
}

export interface AzkarCategory {
  name: string;
  chapters: AzkarChapter[];
}

/** Hisnul Muslim-style dua/azkar collection, bundled statically (not
 * fetched) -- this is fixed reference content that never changes at
 * runtime, same treatment as the Quran corpus gets once cached, just
 * without needing a fetch-and-cache step since it ships in the app
 * bundle. Source and license: see src/data/ATTRIBUTION.md. */
export const AZKAR_CATEGORIES: AzkarCategory[] = azkarJson as AzkarCategory[];
