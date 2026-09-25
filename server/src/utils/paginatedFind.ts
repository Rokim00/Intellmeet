import type { Model, FilterQuery, Query } from 'mongoose';
import { getPagination, buildPaginatedResult, type PaginatedResult } from './pagination.js';

/**
 * Runs a paginated find + matching countDocuments in parallel and wraps the
 * result in the standard paginated envelope. Every list endpoint uses this so
 * paging, sorting, and the `meta` shape cannot drift between resources.
 */
export const findPaginated = async <T>(
  model: Model<any>,
  filter: FilterQuery<any>,
  query: Record<string, unknown> = {},
  options: {
    sort?: Record<string, 1 | -1>;
    select?: string;
    populate?: { path: string; select: string }[];
  } = {}
): Promise<PaginatedResult<T>> => {
  const pagination = getPagination(query);

  const build = (q: Query<any, T[], any>) => {
    if (options.select) q = q.select(options.select);
    for (const { path, select } of options.populate ?? []) {
      q = q.populate(path, select);
    }
    if (options.sort) q = q.sort(options.sort);
    return q.skip(pagination.skip).limit(pagination.limit);
  };

  const [items, total] = await Promise.all([
    build(model.find(filter)) as unknown as Promise<T[]>,
    model.countDocuments(filter)
  ]);

  return buildPaginatedResult(items, total, pagination);
};
