/**
 * Offline surah packs: the surah's full ayah text (Phase 1's corpus, via
 * GET /quran/{surah}), written to a JSON file under the document directory
 * (survives app restarts and isn't cleared under storage pressure the way
 * the cache directory can be).
 *
 * Deliberately text-only, not "text + audio" as the original roadmap
 * sketch described -- the backend has no reciter-audio-serving endpoint at
 * all (confirmed by reading every endpoint file; recitation.py's audio
 * handling is upload-for-checking, not a library of reference audio to
 * download), so an "includes audio" pack would be faking a capability
 * that doesn't exist yet. Tajweed annotation is also left out of v1: one
 * request per ayah for a 286-ayah surah is a lot of round-trips for a
 * supplementary feature; worth a follow-up if offline tajweed is wanted.
 *
 * Every Directory/File object is constructed lazily, inside each function,
 * rather than once at module scope -- a top-level `new Directory(...)`
 * would run native filesystem calls the instant this module is imported,
 * on every platform that imports it (including web, where this API has no
 * backing implementation), crashing app startup for everyone rather than
 * only the user who actually taps "download".
 */
import { Directory, File, Paths } from 'expo-file-system';

import { apiRequest } from './api-client';

import type { SurahDetail } from '@/features/quran/types';

function packsDir(): Directory {
  return new Directory(Paths.document, 'offline-packs');
}

function packFile(surahNumber: number): File {
  return new File(packsDir(), `surah-${surahNumber}.json`);
}

export function isSurahDownloaded(surahNumber: number): boolean {
  try {
    return packFile(surahNumber).exists;
  } catch {
    return false;
  }
}

export function getDownloadedSurah(surahNumber: number): SurahDetail | null {
  try {
    const file = packFile(surahNumber);
    if (!file.exists) return null;
    return JSON.parse(file.textSync()) as SurahDetail;
  } catch {
    // Covers both a corrupt/partial file (app killed mid-write) and a
    // platform where this API doesn't work at all -- either way, fall
    // back to fetching from the network rather than crashing the reader.
    return null;
  }
}

export async function downloadSurah(surahNumber: number): Promise<SurahDetail> {
  const surah = await apiRequest<SurahDetail>(`/api/v1/quran/${surahNumber}`, { auth: false });
  const dir = packsDir();
  if (!dir.exists) dir.create({ intermediates: true });
  packFile(surahNumber).write(JSON.stringify(surah));
  return surah;
}

export function removeDownloadedSurah(surahNumber: number): void {
  try {
    const file = packFile(surahNumber);
    if (file.exists) file.delete();
  } catch {
    // Nothing to clean up if the platform can't read it in the first
    // place.
  }
}

export function listDownloadedSurahs(): number[] {
  try {
    const dir = packsDir();
    if (!dir.exists) return [];
    return dir
      .list()
      .filter((entry): entry is File => entry instanceof File)
      .map((file) => file.name.match(/^surah-(\d+)\.json$/)?.[1])
      .filter((match): match is string => match !== undefined)
      .map(Number);
  } catch {
    return [];
  }
}
