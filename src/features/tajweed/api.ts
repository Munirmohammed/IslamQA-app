import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

import type { TajweedAyahResponse, TajweedRuleInfo } from './types';

export function useTajweedRules() {
  return useQuery({
    queryKey: ['tajweed', 'rules'],
    queryFn: () => apiRequest<TajweedRuleInfo[]>('/api/v1/tajweed/rules', { auth: false }),
    staleTime: Infinity, // the rule legend never changes at runtime
  });
}

export function useAyahTajweed(surah: number | undefined, ayah: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['tajweed', 'ayah', surah, ayah],
    queryFn: () =>
      apiRequest<TajweedAyahResponse>(`/api/v1/tajweed/${surah}/${ayah}`, { auth: false }),
    enabled: enabled && surah !== undefined && ayah !== undefined,
    staleTime: Infinity, // tajweed annotation for a given ayah never changes
  });
}
