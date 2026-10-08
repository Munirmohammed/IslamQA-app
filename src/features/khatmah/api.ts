import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { KhatmahProgress, MarkAyahsReadInput } from './types';

export function useKhatmahProgress() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['khatmah', 'current'],
    queryFn: () => apiRequest<KhatmahProgress>('/api/v1/khatmah/current'),
    enabled: !!accessToken,
  });
}

export function useMarkAyahsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MarkAyahsReadInput) =>
      apiRequest<KhatmahProgress>('/api/v1/khatmah/mark-read', { method: 'POST', body: input }),
    onSuccess: (progress) => {
      queryClient.setQueryData(['khatmah', 'current'], progress);
    },
  });
}

export function useRestartKhatmah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<KhatmahProgress>('/api/v1/khatmah/restart', { method: 'POST' }),
    onSuccess: (progress) => {
      queryClient.setQueryData(['khatmah', 'current'], progress);
    },
  });
}
