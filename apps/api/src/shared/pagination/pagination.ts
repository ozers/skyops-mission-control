import { PaginatedResult, PaginationQuery } from '@skyops/contracts';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/* Clamp caller-supplied paging to safe bounds and fill in defaults. */
export function normalizePagination(query: Partial<PaginationQuery> = {}): PaginationQuery {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(query.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  return { page, pageSize };
}

export function paginate<T>(
  items: T[],
  total: number,
  query: PaginationQuery,
): PaginatedResult<T> {
  return { items, total, page: query.page, pageSize: query.pageSize };
}
