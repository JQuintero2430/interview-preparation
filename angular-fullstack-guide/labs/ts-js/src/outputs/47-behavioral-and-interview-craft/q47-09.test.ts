// Output question Q47.09: our legacy price-label function (Exercise 47.1, read-only) on five inputs.
import { formatPriceLabel } from '../../modules/47-behavioral-and-interview-craft/exercise-1-legacy-refactor/legacy/price-label';
import { captureLogs } from '../capture';

describe('Module 47 · Q47.09', () => {
  it('Q47.09 the legacy price label on five inputs, with the half-cent and the minus label as pinned quirks', async () => {
    const lines = await captureLogs((log) => {
      log(formatPriceLabel(19.99, 'EUR', 10));
      log(formatPriceLabel(1.005));
      log(formatPriceLabel(10, 'USD', 150));
      log(formatPriceLabel(7, 'EUR'));
      log(formatPriceLabel(7, 'eur', 10));
    });
    expect(lines).toEqual(['EUR 17.99', 'USD 1.00', '-USD 5.00', 'EUR 7.00', 'EUR 6.30']);
  });
});
