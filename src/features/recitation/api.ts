import { useMutation } from '@tanstack/react-query';

import { apiUpload } from '@/lib/api-client';

import type { RecitationCheckInput, RecitationCheckResult } from './types';

export function useRecitationCheck() {
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
  });
}
