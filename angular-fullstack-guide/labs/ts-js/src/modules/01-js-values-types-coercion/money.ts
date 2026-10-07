// labs/ts-js/src/modules/01-js-values-types-coercion/money.ts
// Exercise 01.3: an exact money value. Amounts are integers of minor units (cents) held in a BigInt,
// so there is no binary floating point anywhere and no 2^53 ceiling.
// Scope: currencies with exactly two minor units (USD, EUR, GBP…). Supporting JPY (0) or KWD (3)
// means storing the scale per currency instead of the MINOR_UNITS constant.

const MINOR_UNITS = 2;
const MINOR_PER_MAJOR = 10n ** BigInt(MINOR_UNITS);
const AMOUNT_PATTERN = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;
const TO_STRING_TAG = 'Money';

// Asks the platform (ICU currency data) how many fraction digits the currency uses.
function assertTwoMinorUnits(currency: string): void {
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  if (digits !== MINOR_UNITS) {
    throw new RangeError(`${currency} has ${digits} minor units; this Money supports ${MINOR_UNITS}`);
  }
}

/** An immutable amount of money in one currency, exact to the cent. */
export class Money {
  /** The amount in minor units (cents). */
  readonly minor: bigint;
  /** ISO 4217 currency code, for example 'USD'. */
  readonly currency: string;

  private constructor(minor: bigint, currency: string) {
    this.minor = minor;
    this.currency = currency;
  }

  /**
   * Parses a decimal string such as '12.34' or '-5'. Strings, not numbers, are accepted on purpose:
   * a number like 0.1 is already inexact before this function could see it.
   * @param amount optional minus sign, digits, and at most two decimals
   * @param currency an ISO 4217 code whose currency has two minor units
   * @returns the exact amount
   * @throws SyntaxError for a malformed amount; RangeError for an unsupported currency
   */
  static parse(amount: string, currency: string): Money {
    assertTwoMinorUnits(currency);
    const match = AMOUNT_PATTERN.exec(amount);
    if (match === null) {
      throw new SyntaxError(`Not an amount with at most ${MINOR_UNITS} decimals: "${amount}"`);
    }
    const [, sign = '', whole = '0', fraction = ''] = match;
    const magnitude = BigInt(whole) * MINOR_PER_MAJOR + BigInt(fraction.padEnd(MINOR_UNITS, '0'));
    return new Money(sign === '-' ? -magnitude : magnitude, currency);
  }

  /**
   * Adds two amounts of the same currency.
   * @param other the amount to add
   * @returns a new Money with the exact sum
   * @throws TypeError when the currencies differ
   */
  plus(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new TypeError(`Cannot add ${other.currency} to ${this.currency}`);
    }
    return new Money(this.minor + other.minor, this.currency);
  }

  /**
   * Splits the amount by integer ratios without losing or inventing a cent. Each share is rounded
   * toward zero, and the leftover cents go one each to the first shares.
   * @param ratios positive integers, for example [1, 1, 1] or [70, 30]
   * @returns one Money per ratio; their sum always equals this amount
   * @throws RangeError when ratios is empty or contains a value that is not a positive integer
   */
  allocate(ratios: readonly number[]): Money[] {
    if (ratios.length === 0 || ratios.some((ratio) => !Number.isInteger(ratio) || ratio < 1)) {
      throw new RangeError('ratios must be a non-empty list of positive integers');
    }
    const totalRatio = BigInt(ratios.reduce((sum, ratio) => sum + ratio, 0));
    const shares = ratios.map((ratio) => (this.minor * BigInt(ratio)) / totalRatio);
    const leftover = this.minor - shares.reduce((sum, share) => sum + share, 0n);
    const step = leftover < 0n ? -1n : 1n;
    const leftoverCount = leftover * step;
    return shares.map((share, index) =>
      new Money(BigInt(index) < leftoverCount ? share + step : share, this.currency),
    );
  }

  /**
   * The exact amount as a plain decimal string, for example '-1234.50'.
   * @returns the amount with exactly two decimals and no grouping
   */
  toDecimalString(): string {
    const negative = this.minor < 0n;
    const magnitude = negative ? -this.minor : this.minor;
    const fraction = (magnitude % MINOR_PER_MAJOR).toString().padStart(MINOR_UNITS, '0');
    return `${negative ? '-' : ''}${magnitude / MINOR_PER_MAJOR}.${fraction}`;
  }

  /**
   * Formats for display with Intl. The decimal string is passed as is, so Intl formats the exact
   * value instead of a rounded double.
   * @param locale a BCP 47 locale tag such as 'en-US'
   * @returns the localized currency string, for example '$1,234.50'
   */
  format(locale: string): string {
    const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency });
    return formatter.format(this.toDecimalString() as Intl.StringNumericLiteral);
  }

  /**
   * The wire format: the amount travels as a string so no JSON parser turns it into a double.
   * @returns an object such as { amount: '12.34', currency: 'USD' }
   */
  toJSON(): { amount: string; currency: string } {
    return { amount: this.toDecimalString(), currency: this.currency };
  }

  /**
   * A debugging representation, also used by String(money) and template literals.
   * @returns for example '12.34 USD'
   */
  toString(): string {
    return `${this.toDecimalString()} ${this.currency}`;
  }

  /**
   * Allows string conversion only. `money + 1`, `money * 2` or `money == 12.34` throw instead of
   * silently producing a number or a concatenated string.
   * @param hint 'string', 'number' or 'default', chosen by the operator that triggered the conversion
   * @returns the toString() representation for the 'string' hint
   * @throws TypeError for the 'number' and 'default' hints
   */
  [Symbol.toPrimitive](hint: string): string {
    if (hint === 'string') return this.toString();
    throw new TypeError(`Money cannot be converted with the "${hint}" hint; use plus(), allocate() or format()`);
  }

  /** Makes Object.prototype.toString report [object Money]. */
  get [Symbol.toStringTag](): string {
    return TO_STRING_TAG;
  }
}
