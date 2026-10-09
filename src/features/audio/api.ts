import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

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
    queryFn: () =>
      apiRequest<AudioUrlResponse>(`/api/v1/audio/surah/${reciterId}/${surah}`, { auth: false }),
    enabled: reciterId !== null && surah !== undefined,
    staleTime: Infinity,
  });
}
