import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (auth/validation failures aren't fixed by
        // retrying) -- only transient network/5xx failures.
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
