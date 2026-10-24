// Exercise 40.2, variant a: gates, then a weighted sum. The evidence scores are the points; each shown score is the
// weighted total divided by the sum of the weights, which is the same as multiplying by normalized weights.
import { createDecide } from '../decision';
import type { Method } from '../decision';

export const method: Method = {
  name: 'weighted sum',
  points: (scores) => scores,
  report: (total, totalWeight) => total / totalWeight,
};

export const decide = createDecide(method);
