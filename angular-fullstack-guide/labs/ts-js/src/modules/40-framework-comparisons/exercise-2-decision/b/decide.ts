// Exercise 40.2, variant b: gates, then a Borda count per criterion, with the weights as multipliers. Only the order
// of the scores in a criterion counts, never their distance. Our implementation of the rule defined in the text.
import { createDecide } from '../decision';
import type { Method } from '../decision';

/** Candidates scored strictly lower, plus half of the other candidates that tie (a tie shares its places). */
function bordaPoints(column: readonly number[], score: number): number {
  const below = column.filter((other) => other < score).length;
  const ties = column.filter((other) => other === score).length - 1;
  return below + ties / 2;
}

export const method: Method = {
  name: 'Borda count',
  points: (scores) => scores.map((row) => row.map((score, j) => bordaPoints(scores.map((other) => other[j] ?? 0), score))),
  report: (total) => total,
};

export const decide = createDecide(method);
