// Section 10 claims: floats drift when prices are added, integer minor units do not, and `currencyDisplay` changes how the
// currency is written, never how the number is formatted. Results are Node 24's `Intl` (ICU 78.3, CLDR 48.0).

function codePoints(text: string): string {
  return [...text].map((char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
}

describe('Section 10: money', () => {
  it('Section 10: adding prices as floats drifts while integer minor units do not', () => {
    expect(0.1 + 0.2).toBe(0.30000000000000004);
    expect(0.1 + 0.2).not.toBe(0.3);
    // The same prices in cents: 10 + 20 is exactly 30, and only the display divides by 100.
    expect(10 + 20).toBe(30);
    expect((10 + 20) / 100).toBe(0.3);
    // `toFixed` hides the drift for one sum but is not a money formatter: no grouping, no currency, two decimals for yen.
    expect((0.1 + 0.2).toFixed(2)).toBe('0.30');
    expect((1234567.5).toFixed(2)).toBe('1234567.50');
    expect(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JPY' }).format(1235)).toBe('¥1,235');
  });

  it('Section 10: currencyDisplay changes the symbol, not the number format', () => {
    const format = (currencyDisplay: Intl.NumberFormatOptions['currencyDisplay']): string =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', currencyDisplay }).format(1234.5);

    expect(format('symbol'), codePoints(format('symbol'))).toBe('CA$1,234.50');
    expect(format('narrowSymbol'), codePoints(format('narrowSymbol'))).toBe('$1,234.50');
    expect(format('code'), codePoints(format('code'))).toBe('CAD\u00a01,234.50');
    expect(format('name'), codePoints(format('name'))).toBe('1,234.50 Canadian dollars');
  });
});
