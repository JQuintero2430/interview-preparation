export interface SearchResult {
  readonly id: number;
  readonly title: string;
}

export function isSearchResult(value: unknown): value is SearchResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'title' in value &&
    typeof value.title === 'string'
  );
}

/** The boundary guard for `httpResource`'s `parse`: a throw here puts the resource in the error state. */
export function parseSearchResults(raw: unknown): SearchResult[] {
  if (!Array.isArray(raw) || !raw.every(isSearchResult)) {
    throw new Error('Unexpected search response shape');
  }
  return raw;
}
