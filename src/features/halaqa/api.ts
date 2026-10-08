import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { Halaqa, MyHalaqasResponse, StudentSession, StudentSummary } from './types';

export function useMyHalaqas() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['halaqa', 'mine'],
    queryFn: () => apiRequest<MyHalaqasResponse>('/api/v1/halaqa/mine'),
    enabled: !!accessToken,
  });
}

export function useCreateHalaqa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<Halaqa>('/api/v1/halaqa/create', { method: 'POST', body: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqa', 'mine'] });
    },
  });
}

export function useJoinHalaqa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) =>
      apiRequest<{ halaqa_id: string; joined_at: string }>('/api/v1/halaqa/join', {
        method: 'POST',
        body: { join_code: joinCode },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqa', 'mine'] });
    },
  });
}

export function useHalaqaStudents(halaqaId: string | undefined) {
  return useQuery({
    queryKey: ['halaqa', 'students', halaqaId],
    queryFn: () => apiRequest<StudentSummary[]>(`/api/v1/halaqa/${halaqaId}/students`),
    enabled: !!halaqaId,
  });
}

export function useStudentSessions(halaqaId: string | undefined, studentId: string | undefined) {
  return useQuery({
    queryKey: ['halaqa', 'sessions', halaqaId, studentId],
    queryFn: () =>
      apiRequest<StudentSession[]>(`/api/v1/halaqa/${halaqaId}/students/${studentId}/sessions`),
    enabled: !!halaqaId && !!studentId,
  });
}
