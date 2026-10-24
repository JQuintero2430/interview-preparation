// Exercise 47.1: our example of legacy code, not taken from any project. It is branchy and reuses one variable on
// purpose, so a refactor has something to do. Read-only once written: the tests pin what it returns today, quirks
// included (`1.005` gives `USD 1.00`, a discount above 100 gives a minus label, a non-finite price gives `''`).
export function formatPriceLabel(price: number, currency?: string, discountPercent?: number): string {
  let result = '';
  if (isFinite(price)) {
    let c = 'USD';
    if (currency !== undefined) {
      c = currency.toUpperCase();
    }
    let p = price;
    if (discountPercent !== undefined) {
      if (discountPercent !== 0) {
        p = price * (1 - discountPercent / 100);
      }
    }
    if (p < 0) {
      result = '-' + c + ' ' + (0 - p).toFixed(2);
    } else {
      result = c + ' ' + p.toFixed(2);
    }
  }
  return result;
}
