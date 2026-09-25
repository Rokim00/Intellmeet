import { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: () => ['projects', 'list'] as const,
  },
  organization: {
    all: ['organization'] as const,
    members: ['organization', 'members'] as const,
  },
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Auth and project data change on user action, not on a timer. 30s of
        // freshness removes the duplicate-request problem entirely; the
        // dev-only refetch window keeps debugging honest.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: import.meta.env.DEV,
        retry: 1,
        retryDelay: 1000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
