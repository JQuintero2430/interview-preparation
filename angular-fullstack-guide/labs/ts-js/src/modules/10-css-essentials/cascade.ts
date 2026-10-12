// Exercise 10.2: a model of the CSS Cascade Level 5 sort order (section 6.1) for the author origin, not a browser.
// Not modelled: user and user-agent origins, shadow-tree contexts, `@scope`, `revert`, animations, transitions, nested layers.
import { specificity } from './specificity';

export interface Declaration {
  readonly property: string;
  readonly value: string;
  /** The selector of the rule that holds the declaration; omit it for a `style` attribute (an element-attached declaration). */
  readonly selector?: string;
  readonly important?: boolean;
  /** The cascade layer that holds the rule; omit it for an unlayered rule. It must appear in `layerOrder`. */
  readonly layer?: string;
}

type Rank = readonly number[];

const NO_SPECIFICITY = [0, 0, 0] as const;

/** Normal: a later layer ranks higher and unlayered (the implicit final layer) highest. Important: the order is reversed. */
function layerRank(declaration: Declaration, layerOrder: readonly string[]): number {
  const position = declaration.layer === undefined ? layerOrder.length : layerOrder.indexOf(declaration.layer);
  if (position < 0) throw new RangeError(`Layer "${declaration.layer}" is not in layerOrder`);
  return declaration.important ? layerOrder.length - position : position;
}

/** The sort keys in the order the specification applies them: importance, element-attached, layer, specificity, order of appearance. */
function rankOf(declaration: Declaration, order: number, layerOrder: readonly string[]): Rank {
  const [ids, classes, types] = declaration.selector === undefined ? NO_SPECIFICITY : specificity(declaration.selector);
  return [declaration.important ? 1 : 0, declaration.selector === undefined ? 1 : 0, layerRank(declaration, layerOrder), ids, classes, types, order];
}

const compareRanks = (a: Rank, b: Rank): number => a.map((key, index) => key - b[index]!).find((difference) => difference !== 0) ?? 0;

/** The winning value of each property. `layerOrder` lists the layers from the first declared to the last. */
export function resolve(declarations: readonly Declaration[], layerOrder: readonly string[] = []): ReadonlyMap<string, string> {
  const winners = new Map<string, { rank: Rank; value: string }>();
  declarations.forEach((declaration, order) => {
    const rank = rankOf(declaration, order, layerOrder);
    const current = winners.get(declaration.property);
    if (!current || compareRanks(rank, current.rank) > 0) winners.set(declaration.property, { rank, value: declaration.value });
  });
  return new Map([...winners].map(([property, { value }]) => [property, value]));
}
