/** One option of the select: the code is the value, the name is what the user reads and types. */
export interface Country {
  readonly code: string;
  readonly name: string;
}

/** Static data, twelve entries: both variants filter the same list. */
export const COUNTRIES: readonly Country[] = [
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'PE', name: 'Peru' },
  { code: 'ES', name: 'Spain' },
];

/** The countries whose name starts with the query, ignoring case. An empty query matches all of them. */
export function filterCountries(query: string): readonly Country[] {
  const prefix = query.trim().toLowerCase();
  return COUNTRIES.filter((country) => country.name.toLowerCase().startsWith(prefix));
}

/** The sentence the announcer reads for a result count. */
export function matchMessage(count: number): string {
  if (count === 0) return 'No countries match';
  return count === 1 ? '1 country matches' : `${count} countries match`;
}
