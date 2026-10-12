import { InjectionToken, Pipe, PipeTransform, inject } from '@angular/core';

export type Normalizer = (value: string) => string;

// The default normalizer lower-cases; a component's `providers` can replace it for its own template.
export const SEARCH_NORMALIZER = new InjectionToken<Normalizer>('SEARCH_NORMALIZER', {
  factory: () => (value) => value.toLowerCase(),
});

// Counts constructor calls, one per pipe usage; the spec resets it before each test.
export const created = { pure: 0, live: 0 };

// The logic lives in a plain function, so a pipe, a `computed` and a unit test can all call it.
export function search(items: readonly string[], term: string, normalize: Normalizer): string[] {
  const needle = normalize(term);
  return items.filter((item) => normalize(item).includes(needle));
}

@Pipe({ name: 'labSearch' })
export class SearchPipe implements PipeTransform {
  private readonly normalize = inject(SEARCH_NORMALIZER);

  constructor() {
    created.pure++;
  }

  transform(items: readonly string[], term: string): string[] {
    return search(items, term, this.normalize);
  }
}

@Pipe({ name: 'labSearchLive', pure: false })
export class SearchLivePipe implements PipeTransform {
  private readonly normalize = inject(SEARCH_NORMALIZER);

  constructor() {
    created.live++;
  }

  transform(items: readonly string[], term: string): string[] {
    return search(items, term, this.normalize);
  }
}
