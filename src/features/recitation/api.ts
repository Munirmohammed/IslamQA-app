import { useMutation } from '@tanstack/react-query';

import { apiUpload } from '@/lib/api-client';

import type { RecitationCheckInput, RecitationCheckResult } from './types';

export function useRecitationCheck() {
  return useMutation({
    mutationFn: async ({ audioUri, surah, ayah }: RecitationCheckInput) => {
      const formData = new FormData();
      // React Native's FormData expects this {uri, name, type} shape for a
      // file field, not a Blob -- fetch's RN polyfill reads the file by uri.
      formData.append('audio', {
        uri: audioUri,
        name: 'recitation.wav',
        type: 'audio/wav',
      } as unknown as Blob);

      if (surah !== undefined) formData.append('surah', String(surah));
      if (ayah !== undefined) formData.append('ayah', String(ayah));

      return apiUpload<RecitationCheckResult>('/api/v1/recitation/check', formData);
    },
  });
}
