export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Normalises `?page` / `?limit` into skip/limit. Malformed or out-of-range
 * values fall back to defaults rather than erroring, so a bad query param
 * never breaks a list endpoint.
 */
export const getPagination = (query: Record<string, unknown> = {}): PaginationParams => {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> => {
  const totalPages = Math.max(Math.ceil(total / params.limit), 1);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1
    }
  };
};