import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest, apiUpload } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { MistakePatternSummary, RecitationCheckInput, RecitationCheckResult } from './types';

export function useRecitationCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ audioUri, surah, ayah }: RecitationCheckInput) => {
      const fields: Record<string, string> = {};
      if (surah !== undefined) fields.surah = String(surah);
      if (ayah !== undefined) fields.ayah = String(ayah);

      return apiUpload<RecitationCheckResult>('/api/v1/recitation/check', audioUri, {
        fieldName: 'audio',
        mimeType: 'audio/wav',
        fields,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recitation', 'my-mistakes'] });
    },
  });
}

export function useMyMistakePatterns() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['recitation', 'my-mistakes'],
    queryFn: () => apiRequest<MistakePatternSummary>('/api/v1/recitation/my-mistakes'),
    enabled: !!accessToken,
  });
}
