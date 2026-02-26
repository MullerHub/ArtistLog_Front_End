import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client.
 * - staleTime: 5 minutes — avoids redundant network requests for stable data.
 * - retry: 1 — retries once on failure before surfacing an error to the UI.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default queryClient;
