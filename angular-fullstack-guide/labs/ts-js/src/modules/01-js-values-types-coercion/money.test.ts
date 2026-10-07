import { Money } from './money';

const sum = (parts: Money[]): bigint => parts.reduce((total, part) => total + part.minor, 0n);

describe('E01.3 Money: exact amounts without floating point', () => {
  it('parses decimal strings into exact minor units, so 0.10 + 0.20 is 0.30', () => {
    expect(Money.parse('12.34', 'USD').minor).toBe(1234n);
    expect(Money.parse('12.3', 'USD').minor).toBe(1230n);
    expect(Money.parse('-5', 'USD').minor).toBe(-500n);
    const total = Money.parse('0.1', 'USD').plus(Money.parse('0.2', 'USD'));
    expect(total.toDecimalString()).toBe('0.30');
  });

  it('rejects malformed amounts and more than two decimals with SyntaxError', () => {
    expect(() => Money.parse('12.345', 'USD')).toThrow(SyntaxError);
    expect(() => Money.parse('1e3', 'USD')).toThrow(SyntaxError);
    expect(() => Money.parse('', 'USD')).toThrow(SyntaxError);
    expect(() => Money.parse('12,34', 'USD')).toThrow(SyntaxError);
  });

  it('rejects currencies without two minor units, and mixing currencies', () => {
    expect(() => Money.parse('5', 'JPY')).toThrow(RangeError);
    expect(() => Money.parse('1', 'USD').plus(Money.parse('1', 'EUR'))).toThrow(TypeError);
  });

  it('allocates without losing or inventing a cent', () => {
    const shares = Money.parse('100', 'USD').allocate([1, 1, 1]);
    expect(shares.map((share) => share.toDecimalString())).toEqual(['33.34', '33.33', '33.33']);
    expect(sum(shares)).toBe(10000n);
    const negative = Money.parse('-100', 'USD').allocate([1, 1, 1]);
    expect(negative.map((share) => share.toDecimalString())).toEqual(['-33.34', '-33.33', '-33.33']);
    expect(sum(Money.parse('0.05', 'USD').allocate([70, 30]))).toBe(5n);
    expect(() => Money.parse('1', 'USD').allocate([])).toThrow(RangeError);
    expect(() => Money.parse('1', 'USD').allocate([1, 0])).toThrow(RangeError);
  });

  it('stays exact beyond Number.MAX_SAFE_INTEGER cents', () => {
    const big = Money.parse('90071992547409.93', 'USD');
    expect(big.minor).toBe(9007199254740993n);
    expect(big.plus(Money.parse('0.01', 'USD')).toDecimalString()).toBe('90071992547409.94');
    expect(big.format('en-US')).toBe('$90,071,992,547,409.93');
  });

  it('formats with Intl for the requested locale', () => {
    expect(Money.parse('1234.5', 'USD').format('en-US')).toBe('$1,234.50');
    expect(Money.parse('-5', 'USD').format('en-US')).toBe('-$5.00');
    expect(Money.parse('1234.5', 'EUR').format('de-DE')).toBe('1.234,50\u00a0€'); // no-break space before €
  });

  it('fails loudly on accidental arithmetic but converts to string and JSON', () => {
    const price: unknown = Money.parse('12.34', 'USD');
    expect(() => (price as number) + 1).toThrow(TypeError);
    expect(() => (price as number) * 2).toThrow(TypeError);
    expect(() => (price as number) == 12.34).toThrow(TypeError); // == passes the 'default' hint
    const samePrice = price;
    expect(price == samePrice).toBe(true); // two objects: compared by identity, no conversion
    expect(String(price)).toBe('12.34 USD');
    expect(`${price}`).toBe('12.34 USD');
    expect(JSON.stringify({ price })).toBe('{"price":{"amount":"12.34","currency":"USD"}}');
    expect(Object.prototype.toString.call(price)).toBe('[object Money]');
  });
});
