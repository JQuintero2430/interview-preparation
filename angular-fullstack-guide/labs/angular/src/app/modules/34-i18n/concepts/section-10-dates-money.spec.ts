import { DatePipe, CurrencyPipe, formatDate, getNumberOfCurrencyDigits, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import { Component, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Section 10 claims: a date-only string is an instant at UTC midnight, a time zone (not the locale) decides which day
// is shown, the currency code (not the locale) decides the symbol, and the currency's digits decide the decimals.
// Node 24's `Intl` is meant wherever `Intl` appears (ng test runs in Node). Every date passes a time zone: the machine is America/Bogota.
function codePoints(text: string): string {
  return [...text].map((char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
}

function expectSame(actual: string, expected: string): void {
  expect(actual, `got ${codePoints(actual)}, wanted ${codePoints(expected)}`).toBe(expected);
}

/** The decimals of a currency, read from `Intl` (not from the deprecated Angular function under test). */
function intlDigits(currency: string): number {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? -1;
}

/** Integer minor units to a decimal string, with integer arithmetic only. */
function minorToMajor(minor: number, digits: number): string {
  if (digits === 0) return String(minor);
  const factor = 10 ** digits;
  return `${Math.trunc(minor / factor)}.${String(minor % factor).padStart(digits, '0')}`;
}

@Component({
  selector: 'lab-m34-date-host',
  imports: [DatePipe],
  template: `<p id="utc">{{ instant | date: 'yyyy-MM-dd HH:mm' : 'UTC' }}</p>
    <p id="offset">{{ instant | date: 'yyyy-MM-dd HH:mm' : '-0400' }}</p>`,
})
class LabM34DateHost {
  protected readonly instant = new Date('2024-07-08T02:30:00Z');
}

@Component({
  selector: 'lab-m34-money-host',
  imports: [CurrencyPipe],
  template: `<p id="default">{{ 1234.5 | currency }}</p>
    <p id="eur">{{ 1234.5 | currency: 'EUR' }}</p>
    <p id="jpy">{{ 1234.5 | currency: 'JPY' }}</p>
    <p id="clp">{{ 1234.5 | currency: 'CLP' : 'code' }}</p>`,
})
class LabM34MoneyHost {}

function render<T>(type: new () => T): (id: string) => string {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return (id) => fixture.nativeElement.querySelector(`#${id}`).textContent;
}

describe('Section 10: dates, times, numbers and money', () => {
  it('Section 10: a date-only string shows the previous day in New York', () => {
    const birthday = new Date('2024-07-08');

    expect(birthday.toISOString()).toBe('2024-07-08T00:00:00.000Z');
    expect(new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(birthday)).toBe('July 8, 2024');
    expect(new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'America/New_York' }).format(birthday)).toBe('July 7, 2024');
  });

  it("Section 10: the date pipe's timezone argument fixes the displayed day", () => {
    const text = render(LabM34DateHost);

    expect(text('utc')).toBe('2024-07-08 02:30');
    expect(text('offset')).toBe('2024-07-07 22:30');
    // An IANA name is not an offset: `timezoneToOffset` gets NaN and falls back to the host's own zone, without an error.
    const instant = new Date('2024-07-08T02:30:00Z');
    expect(formatDate(instant, 'yyyy-MM-dd HH:mm', 'en-US', 'America/New_York')).toBe(formatDate(instant, 'yyyy-MM-dd HH:mm', 'en-US'));
  });

  it('Section 10: the currency pipe shows USD unless a code or DEFAULT_CURRENCY_CODE is given', () => {
    registerLocaleData(localeDe);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] });
    const text = render(LabM34MoneyHost);

    expectSame(text('default'), '1.234,50\u00a0$');
    expectSame(text('eur'), '1.234,50\u00a0€');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'de' },
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
      ],
    });
    expectSame(render(LabM34MoneyHost)('default'), '1.234,50\u00a0€');
  });

  it('Section 10: yen and Chilean pesos have no minor digits', () => {
    registerLocaleData(localeJa);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'en-US' }] });
    const text = render(LabM34MoneyHost);

    expect(getNumberOfCurrencyDigits('JPY')).toBe(0);
    expect(getNumberOfCurrencyDigits('CLP')).toBe(0);
    expect(getNumberOfCurrencyDigits('EUR')).toBe(2);
    expectSame(text('jpy'), '¥1,235');
    expectSame(text('clp'), 'CLP1,235');
    // Intl reaches the same digits, so the deprecated function can be replaced by it.
    for (const code of ['JPY', 'CLP', 'EUR', 'USD']) {
      expect(getNumberOfCurrencyDigits(code), code).toBe(intlDigits(code));
    }
  });

  it("Section 10: minor units convert exactly with the currency's digits", () => {
    expect(minorToMajor(123450, getNumberOfCurrencyDigits('EUR'))).toBe('1234.50');
    expect(minorToMajor(5, getNumberOfCurrencyDigits('EUR'))).toBe('0.05');
    expect(minorToMajor(1235, getNumberOfCurrencyDigits('JPY'))).toBe('1235');
    expect(minorToMajor(1235, intlDigits('JPY'))).toBe('1235');
  });
});
