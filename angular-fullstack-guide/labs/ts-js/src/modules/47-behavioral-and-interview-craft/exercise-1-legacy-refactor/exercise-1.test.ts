// Exercise 47.1: a characterization table pinned against our legacy example, then six criteria run over both
// refactors (a: extract-function steps; b: an integer minor-units core with a formatter). Pure functions: no network,
// clock, randomness or locale.
import { formatPriceLabel as labelA } from './a/price-label';
import { formatPriceLabel as labelB } from './b/price-label';
import { formatPriceLabel as legacyLabel } from './legacy/price-label';

type Label = (price: number, currency?: string, discountPercent?: number) => string;

interface Pinned {
  readonly args: Parameters<Label>;
  /** What the legacy function returns today. */
  readonly legacy: string;
  /** Set only where the deliberate change gives a different label. */
  readonly now?: string;
}

const PINNED: readonly Pinned[] = [
  { args: [10], legacy: 'USD 10.00' },
  { args: [10, 'eur'], legacy: 'EUR 10.00' },
  { args: [100, 'usd', 25], legacy: 'USD 75.00' },
  { args: [19.99, 'USD', 10], legacy: 'USD 17.99' },
  { args: [10, 'USD', 100], legacy: 'USD 0.00' },
  { args: [10, 'USD', 150], legacy: '-USD 5.00' },
  { args: [Number.NaN], legacy: '' },
  { args: [Number.POSITIVE_INFINITY, 'EUR'], legacy: '' },
  { args: [1.005], legacy: 'USD 1.00', now: 'USD 1.01' },
  { args: [2.675], legacy: 'USD 2.67', now: 'USD 2.68' },
];

describe.each(['a', 'b'])('Exercise 47.1, variant %s', (variant) => {
  const label: Label = variant === 'a' ? labelA : labelB;

  it('the characterization cases pass against the legacy function unchanged', () => {
    for (const row of PINNED) expect(legacyLabel(...row.args)).toBe(row.legacy);
  });

  it('the refactor returns the legacy result on every characterization case except the deliberate change', () => {
    for (const row of PINNED) expect(label(...row.args)).toBe(row.now ?? row.legacy);
  });

  it("the deliberate change rounds a half-cent amount up, from 'USD 1.00' to 'USD 1.01'", () => {
    expect(Math.round(1.005 * 100)).toBe(100);
    expect(legacyLabel(1.005)).toBe('USD 1.00');
    expect(label(1.005)).toBe('USD 1.01');
  });

  it('a discount above 100 keeps the legacy negative label', () => {
    expect(legacyLabel(10, 'USD', 150)).toBe('-USD 5.00');
    expect(label(10, 'USD', 150)).toBe('-USD 5.00');
  });

  it('a non-finite price keeps the legacy empty label', () => {
    for (const price of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(legacyLabel(price)).toBe('');
      expect(label(price, 'EUR', 10)).toBe('');
    }
  });

  it("the refactor keeps the legacy function's signature", () => {
    const sameShape: typeof legacyLabel = label;
    expect(sameShape(10)).toBe(legacyLabel(10));
    expect(label.length).toBe(legacyLabel.length);
  });
});
