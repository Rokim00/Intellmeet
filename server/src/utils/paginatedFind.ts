import type { Model, FilterQuery, RootFilterQuery } from 'mongoose';
import { getPagination, buildPaginatedResult, type PaginatedResult } from './pagination.js';

export interface PaginateOptions {
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: { path: string; select: string }[];
}

/**
 * Runs a paginated find + matching countDocuments in parallel and wraps the
 * result in the standard paginated envelope. Every list endpoint uses this so
 * paging, sorting, and the meta shape cannot drift between resources.
 *
 * Generic over the document type, so callers pass their real model and get real
 * types back without `any. Mongoose's populated-document types are not
 * expressible here, hence the single cast at the return.
 */
export const findPaginated = async <TDoc, TResult = TDoc>(
  model: Model<TDoc>,
  filter: RootFilterQuery<TDoc>,
  query: Record<string, unknown> = {},
  options: PaginateOptions = {}
): Promise<PaginatedResult<TResult>> => {
  const pagination = getPagination(query);

  const itemsQuery = model.find(filter as FilterQuery<TDoc>);
  if (options.select) itemsQuery.select(options.select);
  if (options.populate?.length) itemsQuery.populate(options.populate);

  // Both run in parallel: the count does not depend on the page of documents.
  const [items, total] = await Promise.all([
    itemsQuery.sort(options.sort ?? { created_at: -1 }).skip(pagination.skip).limit(pagination.limit).exec(),
    model.countDocuments(filter as FilterQuery<TDoc>).exec()
  ]);

  return buildPaginatedResult<TResult>(items as unknown as TResult[], total, pagination);
};

