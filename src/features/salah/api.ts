import { apiRequest } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SalahLog, UpdateSalahLogRequest } from './types';

export function useTodaySalah() {
  return useQuery({
    queryKey: ['salah', 'today'],
    queryFn: () => apiRequest<SalahLog>('/api/v1/salah/today'),
  });
}

export function useUpdateSalah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: UpdateSalahLogRequest) =>
      apiRequest<SalahLog>('/api/v1/salah/today', { method: 'PATCH', body: update }),
    onSuccess: (log) => {
      queryClient.setQueryData(['salah', 'today'], log);
      queryClient.invalidateQueries({ queryKey: ['salah', 'history'] });
    },
  });
}

export function useSalahHistory(days = 7) {
  return useQuery({
    queryKey: ['salah', 'history', days],
    queryFn: () => apiRequest<SalahLog[]>(`/api/v1/salah/history?days=${days}`),
  });
}
