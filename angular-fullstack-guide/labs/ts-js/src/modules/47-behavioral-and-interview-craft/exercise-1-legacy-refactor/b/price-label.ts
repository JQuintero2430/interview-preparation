// Exercise 47.1, variant b (the alternative, our model): the amount becomes integer minor units (cents) once, rounded
// half up there, and a separate formatter writes the label from the integer. Same pinned results, same deliberate
// change, same signature as the legacy function.
interface Money {
  readonly negative: boolean;
  readonly cents: number;
}

function toMoney(price: number, discountPercent: number | undefined): Money {
  const amount = price * (1 - (discountPercent ?? 0) / 100);
  const shifted = Number(`${Math.abs(amount)}e2`);
  return { negative: amount < 0, cents: Math.round(shifted) };
}

function formatMoney(money: Money, currency: string | undefined): string {
  const whole = Math.floor(money.cents / 100);
  const fraction = String(money.cents % 100).padStart(2, '0');
  return `${money.negative ? '-' : ''}${(currency ?? 'USD').toUpperCase()} ${whole}.${fraction}`;
}

export function formatPriceLabel(price: number, currency?: string, discountPercent?: number): string {
  return Number.isFinite(price) ? formatMoney(toMoney(price, discountPercent), currency) : '';
}
