import { formatDate, formatNumber } from '@angular/common';
import {
  AsyncPipe,
  CurrencyPipe,
  DATE_PIPE_DEFAULT_OPTIONS,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  I18nSelectPipe,
  JsonPipe,
  KeyValue,
  KeyValuePipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const JULY_8 = new Date(Date.UTC(2024, 6, 8, 15, 30));

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function lines(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('p')).map((p) => p.textContent ?? '');
}

function errorMessage(action: () => unknown): string {
  try {
    action();
  } catch (error) {
    return (error as Error).message;
  }
  return 'no error';
}

// --- date, currency, number and percent with the en-US data ---

@Component({
  selector: 'lab-s6-format-host',
  imports: [DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe],
  template: `
    <p>{{ day | date: 'yyyy-MM-dd HH:mm' : 'UTC' }}</p>
    <p>{{ day | date: 'short' : 'UTC' }}</p>
    <p>{{ day | date: undefined : 'UTC' }}</p>
    <p>{{ day | date: 'fullDate' : 'UTC' }}</p>
    <p>{{ iso | date: 'medium' : 'UTC' }}</p>
    <p>[{{ none | date }}]</p>
    <p>{{ 1234.5 | currency }}</p>
    <p>{{ 1234.5 | currency: 'EUR' }}</p>
    <p>{{ -3 | currency }}</p>
    <p>{{ 0.5 | currency: 'USD' : 'symbol' : '1.0-0' }}</p>
    <p>{{ 3.14159 | number }}</p>
    <p>{{ 3.14159 | number: '1.2-2' }}</p>
    <p>{{ 1234567.891 | number }}</p>
    <p>{{ 5 | number: '3.1-1' }}</p>
    <p>{{ 0.256 | percent }}</p>
    <p>{{ 0.256 | percent: '1.1-1' }}</p>
    <p>{{ [1, 2, 3, 4] | slice: 1 : 3 }}</p>
  `,
})
class FormatHost {
  protected readonly day = JULY_8;
  protected readonly iso = '2024-07-08T09:05:00Z';
  protected readonly none = null;
}

// --- keyvalue: default order and a comparator that differs from it ---

const byValueDescending = (a: KeyValue<string, number>, b: KeyValue<string, number>): number =>
  b.value - a.value;

const byNumericKey = (a: KeyValue<string, number>, b: KeyValue<string, number>): number =>
  Number(a.key) - Number(b.key);

@Component({
  selector: 'lab-s6-keyvalue-host',
  imports: [KeyValuePipe],
  template: `
    <p id="default">@for (e of letters | keyvalue; track e.key) {{{ e.key }} }</p>
    <p id="byValue">@for (e of letters | keyvalue: byValueDescending; track e.key) {{{ e.key }} }</p>
    <p id="numbers">@for (e of numbers | keyvalue; track e.key) {{{ e.key }} }</p>
    <p id="byKey">@for (e of numbers | keyvalue: byNumericKey; track e.key) {{{ e.key }} }</p>
  `,
})
class KeyValueHost {
  protected readonly letters: Record<string, number> = { a: 1, b: 3, c: 2 };
  protected readonly numbers: Record<string, number> = { 10: 1, 9: 1, 2: 1 };
  protected readonly byValueDescending = byValueDescending;
  protected readonly byNumericKey = byNumericKey;
}

// --- i18nPlural ---

@Component({
  selector: 'lab-s6-plural-host',
  imports: [I18nPluralPipe],
  template: `
    <p>{{ 0 | i18nPlural: map }}</p>
    <p>{{ 1 | i18nPlural: map }}</p>
    <p>{{ 5 | i18nPlural: map }}</p>
  `,
})
class PluralHost {
  protected readonly map = { '=0': 'none', '=1': 'one item', other: '# items' };
}

// --- locale data ---

@Component({
  selector: 'lab-s6-locale-host',
  imports: [DecimalPipe],
  template: `<p>{{ 1234.5 | number }}</p>`,
})
class LocaleHost {}

@Component({
  selector: 'lab-s6-bad-date-host',
  imports: [DatePipe],
  template: `<p>{{ text() | date }}</p>`,
})
class BadDateHost {
  readonly text = signal('not a date');
}

@Component({
  selector: 'lab-s6-default-options-host',
  imports: [DatePipe],
  template: `<p>{{ day | date }}</p>`,
})
class DefaultOptionsHost {
  protected readonly day = JULY_8;
}

describe('Section 6: built-in pipes and locale data', () => {
  it('Section 6: date, currency, number and percent format with en-US data', () => {
    const rendered = lines(mount(FormatHost).nativeElement).map((s) => s.replace(/[  ]/g, ' '));

    expect(rendered).toEqual([
      '2024-07-08 15:30',
      '7/8/24, 3:30 PM',
      'Jul 8, 2024',
      'Monday, July 8, 2024',
      'Jul 8, 2024, 9:05:00 AM',
      '[]',
      '$1,234.50',
      '€1,234.50',
      '-$3.00',
      '$1',
      '3.142',
      '3.14',
      '1,234,567.891',
      '005.0',
      '26%',
      '25.6%',
      '2,3',
    ]);
  });

  it('Section 6: keyvalue sorts keys as strings by default and accepts a comparator', () => {
    const root: HTMLElement = mount(KeyValueHost).nativeElement;
    const text = (id: string) => root.querySelector(id)?.textContent?.trim();

    expect(text('#default')).toBe('a b c');
    expect(text('#byValue')).toBe('b c a');
    expect(text('#numbers')).toBe('10 2 9');
    expect(text('#byKey')).toBe('2 9 10');
  });

  it('Section 6: i18nPlural picks the category and replaces #', () => {
    expect(lines(mount(PluralHost).nativeElement)).toEqual(['none', 'one item', '5 items']);
  });

  it('Section 6: an unregistered locale throws NG0701 and en-GB falls back to en', () => {
    expect(errorMessage(() => formatNumber(1234.5, 'de', '1.1-1'))).toContain(
      'NG0701: Missing locale data for the locale "de".',
    );
    expect(formatDate(JULY_8, 'mediumDate', 'en-GB', 'UTC')).toBe('Jul 8, 2024');

    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] });
    expect(errorMessage(() => mount(LocaleHost))).toContain('NG0701');
  });

  it('Section 6: an invalid date string throws InvalidPipeArgument', () => {
    expect(errorMessage(() => mount(BadDateHost))).toBe(
      `NG02100: InvalidPipeArgument: 'NG02311: Unable to convert "not a date" into a date' for pipe 'DatePipe'`,
    );
  });

  it('Section 6: DATE_PIPE_DEFAULT_OPTIONS changes the default format', () => {
    expect(lines(mount(DefaultOptionsHost).nativeElement)).toEqual(['Jul 8, 2024']);
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [{ provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'shortDate', timezone: 'UTC' } }],
    });

    expect(lines(mount(DefaultOptionsHost).nativeElement)).toEqual(['7/8/24']);
  });

  it('Section 6: json, keyvalue, slice and async are impure and the other built-ins pure', () => {
    const pureFlag = (pipe: unknown): boolean =>
      (pipe as { ɵpipe: { pure: boolean } }).ɵpipe.pure;
    const all = {
      AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, I18nPluralPipe, I18nSelectPipe, JsonPipe,
      KeyValuePipe, LowerCasePipe, PercentPipe, SlicePipe, TitleCasePipe, UpperCasePipe,
    };
    const impure = Object.entries(all)
      .filter(([, pipe]) => !pureFlag(pipe))
      .map(([name]) => name);

    expect(Object.keys(all).length).toBe(13);
    expect(impure).toEqual(['AsyncPipe', 'JsonPipe', 'KeyValuePipe', 'SlicePipe']);
  });
});
