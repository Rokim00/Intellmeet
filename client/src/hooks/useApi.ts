import { useMemo } from 'react';
import {
  useQuery as useTanstackQuery,
  useMutation as useTanstackMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

/**
 * Thin wrappers over TanStack Query.
 *
 * The wrappers exist for two reasons:
 *  1. envelope unwrapping (`{ success, message, data }` → `data`) happens once,
 *     here, instead of at every call site
 *  2. the return shape is normalised to `loading` / `refetch` so components read
 *     the same way regardless of which layer produced the data
 */

/** Any of the per-resource API functions; each resolves to an AxiosResponse. */
type Fetcher = () => Promise<{ data: unknown }>;

/**
 * The API envelope is `{ success, message, data, meta? }`. List endpoints put
 * `{ items, pagination }` inside `data` (see buildPaginatedResult on the
 * server), while single resources put the object itself there. Both shapes are
 * unwrapped here so components only ever see the payload they asked for.
 */
const unwrapOne = <T,>(response: unknown): T =>
  (response as { data: { data: T } }).data.data;

const isPaginated = (value: unknown): value is { items: unknown[] } =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as { items?: unknown }).items);

/** Returns the array for a list endpoint, whether paginated or already flat. */
const unwrapList = <T,>(response: unknown): T[] => {
  const payload = unwrapOne<unknown>(response);
  if (Array.isArray(payload)) return payload as T[];
  if (isPaginated(payload)) return payload.items as T[];
  return [];
};

export interface QueryResult<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  refetch: () => Promise<unknown>;
}

interface AppQueryOptions {
  /** Skip fetching entirely, e.g. until the user is authenticated. */
  enabled?: boolean;
  /** Overrides the client default for this query. */
  staleTime?: number;
  /**
   * Set for list endpoints. Unwraps the `{ items, pagination }` payload so the
   * result is always a plain array. Without this a paginated list arrives as an
   * object, and any `.map` / `.filter` on it throws.
   */
  list?: boolean;
}

export const useQuery = <T,>(
  queryKey: readonly unknown[],
  fetcher: Fetcher,
  { enabled = true, staleTime, list = false }: AppQueryOptions = {}
): QueryResult<T> => {
  const result = useTanstackQuery({
    queryKey,
    queryFn: async () => (list ? unwrapList<T>(await fetcher()) : unwrapOne<T>(await fetcher())),
    enabled,
    staleTime,
  }) as UseQueryResult<T, unknown>;

  return useMemo(
    () => ({
      data: result.data,
      error: result.error,
      // `isPending` is true only on the first load with no data, so a background
      // refetch does not flash a skeleton over content the user is reading.
      loading: result.isPending,
      refetch: result.refetch as () => Promise<unknown>,
    }),
    [result.data, result.error, result.isPending, result.refetch]
  );
};

interface AppMutationOptions<TData, TVars> {
  mutationFn: (vars: TVars) => Promise<{ data: unknown }>;
  /** Query keys to mark stale after success. Prefix matching applies. */
  invalidates?: readonly (readonly unknown[])[];
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
}

export interface MutationResult<TData, TVars> {
  data: TData | undefined;
  error: unknown;
  pending: boolean;
  mutate: (vars: TVars) => void;
  mutateAsync: (vars: TVars) => Promise<TData>;
  reset: () => void;
}

export const useMutation = <TData, TVars = void>(
  options: AppMutationOptions<TData, TVars>
): MutationResult<TData, TVars> => {
  const queryClient = useQueryClient();

  const result = useTanstackMutation({
    mutationFn: async (vars: TVars) => unwrapOne<TData>(await options.mutationFn(vars)),
    onSuccess: (data) => {
      for (const key of options.invalidates ?? []) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      options.onSuccess?.(data);
    },
    onError: options.onError,
  }) as UseMutationResult<TData, unknown, TVars>;

  // `mutateAsync` is stable across renders in TanStack Query v5, so it is
  // returned directly rather than re-wrapped in a useCallback.
  return useMemo(
    () => ({
      data: result.data,
      error: result.error,
      pending: result.isPending,
      mutate: result.mutate as unknown as (vars: TVars) => void,
      mutateAsync: result.mutateAsync,
      reset: result.reset,
    }),
    [
      result.data,
      result.error,
      result.isPending,
      result.mutate,
      result.mutateAsync,
      result.reset
    ]
  );
};

