// Exercise 47.1, variant a (the solution, our model): extract-function steps with the legacy arithmetic, plus the one
// deliberate change: the amount is rounded half up, so `1.005` reads `USD 1.01`. Same signature as the legacy function.
function currencyCode(currency: string | undefined): string {
  return (currency ?? 'USD').toUpperCase();
}

function discounted(price: number, discountPercent: number | undefined): number {
  return price * (1 - (discountPercent ?? 0) / 100);
}

/** Shifts the decimal point of the amount's own text by two places, so 1.005 becomes 100.5, not 100.49999999999999. */
function shiftedByTwo(amount: number): number {
  const shifted = Number(`${amount}e2`);
  return Number.isNaN(shifted) ? amount * 100 : shifted;
}

function twoDecimals(amount: number): string {
  return (Math.round(shiftedByTwo(amount)) / 100).toFixed(2);
}

export function formatPriceLabel(price: number, currency?: string, discountPercent?: number): string {
  if (!Number.isFinite(price)) return '';
  const amount = discounted(price, discountPercent);
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencyCode(currency)} ${twoDecimals(Math.abs(amount))}`;
}
