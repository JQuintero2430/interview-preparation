// Variant a (our solution): each hop uses the first row of its major, the `.0.x` row.
import { planWith } from '../hops';
import type { Planner } from '../hops';
import { refuseJump } from '../refusal';

export const planner: Planner = {
  refuse: refuseJump,
  plan: (from, to, node) => planWith(from, to, node, (rows) => rows[0]),
};
