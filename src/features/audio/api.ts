import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import {
  downloadSurahAudio,
  getDownloadedSurahAudioUri,
  isSurahAudioDownloaded,
  removeDownloadedSurahAudio,
} from '@/lib/offline-packs';

import type { AudioUrlResponse, Reciter } from './types';

export function useReciters() {
  return useQuery({
    queryKey: ['audio', 'reciters'],
    queryFn: () => apiRequest<Reciter[]>('/api/v1/audio/reciters', { auth: false }),
    staleTime: Infinity, // the reciter list never changes at runtime
  });
}

export function useAyahAudioUrl(
  reciterId: number | null,
  surah: number | undefined,
  ayah: number | undefined
) {
  return useQuery({
    queryKey: ['audio', 'ayah', reciterId, surah, ayah],
    queryFn: () =>
      apiRequest<AudioUrlResponse>(`/api/v1/audio/ayah/${reciterId}/${surah}/${ayah}`, { auth: false }),
    enabled: reciterId !== null && surah !== undefined && ayah !== undefined,
    staleTime: Infinity, // a given reciter's recording of a given ayah never changes
  });
}

export function useSurahAudioUrl(reciterId: number | null, surah: number | undefined) {
  return useQuery({
    queryKey: ['audio', 'surah', reciterId, surah],
    // A downloaded copy, once present, is authoritative for this
    // (reciter, surah) pair -- check it before ever touching the network,
    // same pattern as useSurah() for offline text.
    queryFn: (): AudioUrlResponse | Promise<AudioUrlResponse> => {
      if (reciterId === null || surah === undefined) throw new Error('reciterId and surah are required');
      const offlineUri = getDownloadedSurahAudioUri(surah, reciterId);
      if (offlineUri) return { url: offlineUri };
      return apiRequest<AudioUrlResponse>(`/api/v1/audio/surah/${reciterId}/${surah}`, { auth: false });
    },
    enabled: reciterId !== null && surah !== undefined,
    staleTime: Infinity,
  });
}

export function useIsSurahAudioDownloaded(reciterId: number, surah: number) {
  return isSurahAudioDownloaded(surah, reciterId);
}

export function useDownloadSurahAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surah, reciterId }: { surah: number; reciterId: number }) =>
      downloadSurahAudio(surah, reciterId),
    onSuccess: (_uri, { surah, reciterId }) => {
      queryClient.invalidateQueries({ queryKey: ['audio', 'surah', reciterId, surah] });
    },
  });
}

export function useRemoveDownloadedSurahAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ surah, reciterId }: { surah: number; reciterId: number }) =>
      removeDownloadedSurahAudio(surah, reciterId),
    onSuccess: (_result, { surah, reciterId }) => {
      queryClient.invalidateQueries({ queryKey: ['audio', 'surah', reciterId, surah] });
    },
  });
}
