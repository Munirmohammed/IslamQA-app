import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import type { LoginInput, RegisterInput, TokenResponse, UserResponse } from './types';

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiRequest<UserResponse>('/api/v1/auth/me'),
    enabled: !!accessToken,
    retry: false,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<UserResponse>('/api/v1/auth/register', { method: 'POST', body: input, auth: false }),
  });
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<TokenResponse>('/api/v1/auth/login', {
        method: 'POST',
        form: { username: input.username, password: input.password },
        auth: false,
      }),
    onSuccess: async (tokens) => {
      await setTokens(tokens.access_token, tokens.refresh_token);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearTokens();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
