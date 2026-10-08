import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import {
  downloadSurah,
  getDownloadedSurah,
  isSurahDownloaded,
  listDownloadedSurahs,
  removeDownloadedSurah,
} from '@/lib/offline-packs';

import type { RandomAyah, SurahDetail, SurahSummary } from './types';

export function useSurahs() {
  return useQuery({
    queryKey: ['quran', 'surahs'],
    queryFn: () => apiRequest<SurahSummary[]>('/api/v1/quran/surahs', { auth: false }),
    staleTime: Infinity, // the surah list never changes at runtime
  });
}

export function useSurah(surahNumber: number | undefined) {
  return useQuery({
    queryKey: ['quran', 'surah', surahNumber],
    // An offline pack, once downloaded, is authoritative for this surah --
    // check it before ever touching the network, so a downloaded surah
    // genuinely reads with no connection at all, not just "usually cached".
    queryFn: () => {
      if (surahNumber === undefined) throw new Error('surahNumber is required');
      const offline = getDownloadedSurah(surahNumber);
      if (offline) return offline;
      return apiRequest<SurahDetail>(`/api/v1/quran/${surahNumber}`, { auth: false });
    },
    enabled: surahNumber !== undefined,
    staleTime: Infinity, // ayah text never changes at runtime
  });
}

export function useDownloadedSurahs() {
  return useQuery({
    queryKey: ['quran', 'offline-packs'],
    queryFn: () => listDownloadedSurahs(),
  });
}

export function useIsSurahDownloaded(surahNumber: number) {
  const { data } = useDownloadedSurahs();
  return data?.includes(surahNumber) ?? isSurahDownloaded(surahNumber);
}

export function useDownloadSurah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surahNumber: number) => downloadSurah(surahNumber),
    onSuccess: (surah, surahNumber) => {
      queryClient.setQueryData(['quran', 'surah', surahNumber], surah);
      queryClient.invalidateQueries({ queryKey: ['quran', 'offline-packs'] });
    },
  });
}

/** Fetches a fresh random ayah on demand -- a mutation rather than a
 * query, since "get another random question" is an explicit action, not
 * a cacheable resource. Pass a surah number to scope it, or undefined for
 * anywhere in the Quran. Powers the Mutashabihat quiz's question source
 * (see src/app/quran/quiz.tsx) so the quiz doesn't reveal its own answer. */
export function useRandomAyah() {
  return useMutation({
    mutationFn: (surah?: number) =>
      apiRequest<RandomAyah>(
        `/api/v1/quran/random-ayah${surah !== undefined ? `?surah=${surah}` : ''}`,
        { auth: false }
      ),
  });
}

export function useRemoveDownloadedSurah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (surahNumber: number) => removeDownloadedSurah(surahNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran', 'offline-packs'] });
    },
  });
}
