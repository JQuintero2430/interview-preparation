export type ProductSort = 'name' | 'price';

export interface ProductFilters {
  readonly q: string;
  readonly page: number;
  readonly sort: ProductSort;
}

export const DEFAULT_FILTERS: ProductFilters = { q: '', page: 1, sort: 'name' };

/** Reads the raw query parameters; anything missing or invalid becomes the default. */
export function parseFilters(params: Readonly<Record<string, unknown>>): ProductFilters {
  const { q, page, sort } = params;
  return {
    q: typeof q === 'string' ? q.trim() : DEFAULT_FILTERS.q,
    page: parsePage(page),
    sort: sort === 'name' || sort === 'price' ? sort : DEFAULT_FILTERS.sort,
  };
}

function parsePage(raw: unknown): number {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
    return DEFAULT_FILTERS.page;
  }
  return Number(raw);
}

/** The parameters worth writing to the URL: values equal to the default are left out. */
export function toQueryParams(filters: ProductFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q !== DEFAULT_FILTERS.q) {
    params['q'] = filters.q;
  }
  if (filters.page !== DEFAULT_FILTERS.page) {
    params['page'] = String(filters.page);
  }
  if (filters.sort !== DEFAULT_FILTERS.sort) {
    params['sort'] = filters.sort;
  }
  return params;
}
