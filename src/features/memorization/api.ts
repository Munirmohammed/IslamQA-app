import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type {
  AddCardsInput,
  CardResponse,
  DueCard,
  ReviewCardInput,
  SimilarAyahsResponse,
} from './types';

export function useDueCards(limit = 20) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['memorization', 'due', limit],
    queryFn: () => apiRequest<DueCard[]>(`/api/v1/memorization/due?limit=${limit}`),
    enabled: !!accessToken,
  });
}

export function useAddToMemorization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCardsInput) =>
      apiRequest<CardResponse[]>('/api/v1/memorization/add', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorization', 'due'] });
    },
  });
}

export function useSimilarAyahs(surah: number | undefined, ayah: number | undefined, limit = 5) {
  return useQuery({
    queryKey: ['memorization', 'similar', surah, ayah, limit],
    queryFn: () =>
      apiRequest<SimilarAyahsResponse>(
        `/api/v1/memorization/similar/${surah}/${ayah}?limit=${limit}`,
        { auth: false }
      ),
    enabled: surah !== undefined && ayah !== undefined,
  });
}

export function useReviewCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewCardInput) =>
      apiRequest<CardResponse>('/api/v1/memorization/review', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorization', 'due'] });
    },
  });
}
