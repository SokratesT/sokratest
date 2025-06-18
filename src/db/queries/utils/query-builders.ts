import { asc, desc, type SQL } from "drizzle-orm";

interface PaginationOptions {
  pageIndex: number;
  pageSize: number;
}

interface SortOptions {
  id: string;
  desc: boolean;
}

export function buildPagination(options: PaginationOptions) {
  const { pageIndex, pageSize } = options;
  return {
    limit: pageSize,
    offset: pageIndex * pageSize,
  };
}

export function buildSortOrder<T extends Record<string, any>>(
  sort: SortOptions[],
  table: T,
  validColumns: (keyof T)[],
  defaultSort?: keyof T,
): SQL[] {
  if (!sort || sort.length === 0) {
    return defaultSort ? [asc(table[defaultSort])] : [];
  }

  return sort
    .filter((s) => validColumns.includes(s.id as keyof T))
    .map((s) => {
      const column = table[s.id as keyof T];
      return s.desc ? desc(column) : asc(column);
    });
}
