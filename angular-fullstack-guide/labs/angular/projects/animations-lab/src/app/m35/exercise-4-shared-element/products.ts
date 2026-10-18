/** One product: a stable id for `track` and the transition name, a name and a filter tag. */
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly tag: 'hand' | 'power';
}

/** The products both pages know: the list shows them as cards, the detail page shows one as its header. */
export const PRODUCTS: readonly Product[] = [
  { id: 1, name: 'Hammer', tag: 'hand' },
  { id: 2, name: 'Drill', tag: 'power' },
  { id: 3, name: 'Saw', tag: 'hand' },
  { id: 4, name: 'Sander', tag: 'power' },
];

/** The transition name a product's card and header share. */
export const transitionName = (id: number): string => `product-${id}`;
