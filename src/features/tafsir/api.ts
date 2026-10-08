import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

import type { TafsirAyahResponse, TafsirSearchResponse } from './types';

export function useAyahTafsir(surah: number | undefined, ayah: number | undefined) {
  return useQuery({
    queryKey: ['tafsir', 'ayah', surah, ayah],
    queryFn: () => apiRequest<TafsirAyahResponse>(`/api/v1/tafsir/${surah}/${ayah}`, { auth: false }),
    enabled: surah !== undefined && ayah !== undefined,
    staleTime: Infinity, // tafsir text for a given ayah never changes
  });
}

export function useTafsirSearch(query: string) {
  return useQuery({
    queryKey: ['tafsir', 'search', query],
    queryFn: () =>
      apiRequest<TafsirSearchResponse>(
        `/api/v1/tafsir/search?q=${encodeURIComponent(query)}`,
        { auth: false }
      ),
    enabled: query.trim().length >= 2,
  });
}
