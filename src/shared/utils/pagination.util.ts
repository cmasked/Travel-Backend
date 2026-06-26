import { PaginationMeta } from '../interfaces/pagination.interface';

/**
 * Builds the standard pagination metadata object used across the application.
 * Calculates total pages, next page, and previous page based on the current page and limit.
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}
