import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

import type { SurahDetail, SurahSummary } from './types';

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
    queryFn: () => apiRequest<SurahDetail>(`/api/v1/quran/${surahNumber}`, { auth: false }),
    enabled: surahNumber !== undefined,
    staleTime: Infinity, // ayah text never changes at runtime
  });
}
