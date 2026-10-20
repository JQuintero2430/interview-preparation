// The contract both planners share, and the part that does not change: one hop per major, with the row's Node check.
import { compat } from './fixtures/compat';
import type { CompatRow } from './fixtures/compat';
import { satisfies } from './range';

export interface Hop {
  readonly from: number;
  readonly to: number;
  /** The Angular column of the compatibility row this hop used, as the page writes it. */
  readonly angular: string;
  /** The Node range of that row. */
  readonly node: string;
  /** The TypeScript range of that row. */
  readonly typescript: string;
  /** Whether the Node version the caller runs satisfies `node`. */
  readonly nodeFits: boolean;
}

export interface Planner {
  /** The message the CLI's check gives for a jump of `from` to `to`, or `undefined` when the check lets it pass. */
  refuse(name: string, from: number, to: number): string | undefined;
  /** One hop per major after `from`, up to and including `to`. */
  plan(from: number, to: number, node: string): Hop[];
}

/** Chooses the row a major's hop uses among that major's rows (oldest first). */
export type RowChoice = (rows: readonly CompatRow[]) => CompatRow | undefined;

export function planWith(from: number, to: number, node: string, choose: RowChoice): Hop[] {
  if (to < from) throw new Error(`our planner does not plan a downgrade: ${from} to ${to}`);
  const hops: Hop[] = [];
  for (let major = from + 1; major <= to; major++) {
    const row = choose(compat.filter((candidate) => candidate.major === major));
    if (row === undefined) throw new Error(`the fixture has no row for ${major}.0.x`);
    hops.push({ from: major - 1, to: major, angular: row.angular, node: row.node, typescript: row.typescript, nodeFits: satisfies(node, row.node) });
  }
  return hops;
}
