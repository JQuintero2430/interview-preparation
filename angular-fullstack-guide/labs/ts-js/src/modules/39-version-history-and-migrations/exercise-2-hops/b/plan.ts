// Variant b (our alternative): each hop uses the last row of its major, the newest minors the page lists, so the
// TypeScript upper bound is the one that major reached by its end, not the one it started with.
import { planWith } from '../hops';
import type { Planner } from '../hops';
import { refuseJump } from '../refusal';

export const planner: Planner = {
  refuse: refuseJump,
  plan: (from, to, node) => planWith(from, to, node, (rows) => rows.at(-1)),
};
