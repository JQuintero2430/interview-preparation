import { DatePipe, formatCurrency, formatDate, formatNumber, registerLocaleData } from '@angular/common';
import localeArEg from '@angular/common/locales/ar-EG';
import localeFr from '@angular/common/locales/fr';
import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Section 3 claims: Angular formats from locale data it ships and you register, the platform's `Intl`
// formats from the engine's ICU, and the two print different characters for the same value.
// Node 24's `Intl` is meant wherever `Intl` appears (ng test runs in Node, jsdom has no ICU of its own).
// Registered data is process-wide and `ng test` isolates each spec file, so no test can leak into another file.
const instant = new Date('2024-07-08T15:30:00Z');

function codePoints(text: string): string {
  return [...text].map((char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
}

function expectSame(actual: string, expected: string): void {
  expect(actual, `got ${codePoints(actual)}, wanted ${codePoints(expected)}`).toBe(expected);
}

@Component({
  selector: 'lab-m34-date-host',
  imports: [DatePipe],
  template: `<p id="own">{{ instant | date: 'fullDate' : 'UTC' }}</p>
    <p id="override">{{ instant | date: 'fullDate' : 'UTC' : 'en-US' }}</p>`,
})
class LabM34DateHost {
  protected readonly instant = instant;
}

describe('Section 3: Angular locale data versus Intl', () => {
  it('Section 3: registering fr data makes formatDate print French', () => {
    registerLocaleData(localeFr);

    expectSame(formatDate(instant, 'fullDate', 'fr', 'UTC'), 'lundi 8 juillet 2024');
  });

  it('Section 3: an unregistered locale throws NG0701 from formatNumber', () => {
    expect(() => formatNumber(1234.5, 'pt')).toThrowError('NG0701: Missing locale data for the locale "pt".');
  });

  it('Section 3: the global variant registers the locale when imported', async () => {
    expect(() => formatNumber(1234.5, 'de'), 'before the import').toThrowError(/NG0701/);

    // @ts-expect-error The global variants ship no declaration file (TS7016 without this line).
    await import('@angular/common/locales/global/de');

    expectSame(formatNumber(1234.5, 'de'), '1.234,5');
  });

  it("Section 3: Angular puts U+202F before PM where Node's Intl puts a space", () => {
    const angular = formatDate(instant, 'short', 'en-US', 'UTC');
    const platform = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(instant);

    expectSame(angular, '7/8/24, 3:30\u202fPM');
    expectSame(platform, '7/8/24, 3:30\u0020PM');
  });

  it('Section 3: Angular prints Latin digits for ar-EG where Intl prints Arabic-Indic digits', () => {
    registerLocaleData(localeArEg);

    expectSame(formatNumber(1234.5, 'ar-EG'), '1,234.5');
    expectSame(new Intl.NumberFormat('ar-EG').format(1234.5), '\u0661\u066c\u0662\u0663\u0664\u066b\u0665');
  });

  it('Section 3: both print the same French currency string', () => {
    registerLocaleData(localeFr);

    const angular = formatCurrency(1234.5, 'fr', '\u20ac', 'EUR');
    const platform = new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(1234.5);

    expectSame(angular, '1\u202f234,50\u00a0\u20ac');
    expectSame(platform, angular);
    // The third parameter is the text to print, not a lookup key: a code there prints as given.
    expectSame(formatCurrency(1234.5, 'fr', 'EUR', 'EUR'), '1\u202f234,50\u00a0EUR');
  });

  it('Section 3: the DatePipe with a locale argument overrides LOCALE_ID', () => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'fr' }] });
    const fixture = TestBed.createComponent(LabM34DateHost);
    fixture.detectChanges();
    const text = (id: string): string => fixture.nativeElement.querySelector(`#${id}`).textContent;

    expectSame(text('own'), 'lundi 8 juillet 2024');
    expectSame(text('override'), 'Monday, July 8, 2024');
  });
});
