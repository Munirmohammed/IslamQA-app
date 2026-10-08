import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { HistoryResponse, LeaderboardResponse, LogProgressInput, StreakResponse } from './types';

export function useStreak() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => apiRequest<StreakResponse>('/api/v1/gamification/me'),
    enabled: !!accessToken,
  });
}

export function useHistory(days = 30) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['gamification', 'history', days],
    queryFn: () => apiRequest<HistoryResponse>(`/api/v1/gamification/history?days=${days}`),
    enabled: !!accessToken,
  });
}

export function useLeaderboard(metric: 'total_hasanat' | 'current_streak' = 'total_hasanat') {
  return useQuery({
    queryKey: ['gamification', 'leaderboard', metric],
    queryFn: () =>
      apiRequest<LeaderboardResponse>(`/api/v1/gamification/leaderboard?metric=${metric}`, {
        auth: false,
      }),
  });
}

export function useLogProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LogProgressInput) =>
      apiRequest<StreakResponse>('/api/v1/gamification/log-progress', {
        method: 'POST',
        body: input,
      }),
    onSuccess: (streak) => {
      queryClient.setQueryData(['gamification', 'me'], streak);
      queryClient.invalidateQueries({ queryKey: ['gamification', 'leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'history'] });
    },
  });
}
