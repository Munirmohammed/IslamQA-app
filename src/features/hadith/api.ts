import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

import type { Hadith, HadithCollectionSummary, HadithPage } from './types';

export function useHadithCollections() {
  return useQuery({
    queryKey: ['hadith', 'collections'],
    queryFn: () => apiRequest<HadithCollectionSummary[]>('/api/v1/hadith/collections', { auth: false }),
    staleTime: Infinity, // the collection list never changes at runtime
  });
}

export function useHadithPage(collection: string | undefined, page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['hadith', collection, page, pageSize],
    queryFn: () =>
      apiRequest<HadithPage>(
        `/api/v1/hadith/${collection}?page=${page}&page_size=${pageSize}`,
        { auth: false }
      ),
    enabled: collection !== undefined,
    staleTime: Infinity, // hadith text never changes at runtime
  });
}

export function useHadith(collection: string | undefined, hadithNumber: number | undefined) {
  return useQuery({
    queryKey: ['hadith', collection, 'single', hadithNumber],
    queryFn: () => apiRequest<Hadith>(`/api/v1/hadith/${collection}/${hadithNumber}`, { auth: false }),
    enabled: collection !== undefined && hadithNumber !== undefined,
    staleTime: Infinity,
  });
}
