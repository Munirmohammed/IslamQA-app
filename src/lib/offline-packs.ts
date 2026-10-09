/**
 * Offline surah packs: the surah's full ayah text (Phase 1's corpus, via
 * GET /quran/{surah}), written to a JSON file under the document directory
 * (survives app restarts and isn't cleared under storage pressure the way
 * the cache directory can be).
 *
 * Audio downloads (one reciter's full-surah mp3 at a time, not every
 * ayah individually -- a single file per surah is both simpler to manage
 * and all a surah-level "Play surah" control needs offline) were added
 * once the backend grew a reciter-audio-resolving endpoint (D1); before
 * that there was nothing to download. Tajweed annotation is still left
 * out of v1: one request per ayah for a 286-ayah surah is a lot of
 * round-trips for a supplementary feature; worth a follow-up if offline
 * tajweed is wanted.
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

import type { AudioUrlResponse } from '@/features/audio/types';
import type { SurahDetail } from '@/features/quran/types';

function packsDir(): Directory {
  return new Directory(Paths.document, 'offline-packs');
}

function packFile(surahNumber: number): File {
  return new File(packsDir(), `surah-${surahNumber}.json`);
}

function audioPackFile(surahNumber: number, reciterId: number): File {
  return new File(packsDir(), `surah-${surahNumber}-audio-${reciterId}.mp3`);
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

export function isSurahAudioDownloaded(surahNumber: number, reciterId: number): boolean {
  try {
    return audioPackFile(surahNumber, reciterId).exists;
  } catch {
    return false;
  }
}

/** A local file:// URI usable directly as an audio player's source, or
 * null if this reciter's surah hasn't been downloaded. */
export function getDownloadedSurahAudioUri(surahNumber: number, reciterId: number): string | null {
  try {
    const file = audioPackFile(surahNumber, reciterId);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

export async function downloadSurahAudio(surahNumber: number, reciterId: number): Promise<string> {
  const { url } = await apiRequest<AudioUrlResponse>(`/api/v1/audio/surah/${reciterId}/${surahNumber}`, {
    auth: false,
  });
  const dir = packsDir();
  if (!dir.exists) dir.create({ intermediates: true });
  const file = await File.downloadFileAsync(url, audioPackFile(surahNumber, reciterId), { idempotent: true });
  return file.uri;
}

export function removeDownloadedSurahAudio(surahNumber: number, reciterId: number): void {
  try {
    const file = audioPackFile(surahNumber, reciterId);
    if (file.exists) file.delete();
  } catch {
    // Nothing to clean up if the platform can't read it in the first
    // place.
  }
}
