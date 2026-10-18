/// <reference types="@angular/localize" />

import { Directionality } from '@angular/cdk/bidi';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  I18nPluralPipe,
  registerLocaleData,
} from '@angular/common';
import localeArEg from '@angular/common/locales/ar-EG';
import localeFr from '@angular/common/locales/fr';
import { Component, DEFAULT_CURRENCY_CODE, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  clearTranslations,
  loadTranslations,
  ɵparseMessage as parseMessage,
  ɵParsedMessage as ParsedMessage,
} from '@angular/localize';

// Output questions of module 34 that run under `ng test` (jsdom, development mode). Each test is named after its question ID.
// `ng test` loads `@angular/localize/init` itself, so `$localize` exists; each test restores `$localize.locale`
// and clears the translations it installed. Every date passes a time zone; `ɵparseMessage` is internal and may change in any release.
// Registered locale data is process-wide and `ng test` isolates each spec file, so registering it here leaks nowhere.
const instant = new Date('2024-07-08T15:30:00Z');

function codePoints(text: string): string {
  return [...text]
    .map((char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}

function expectSame(actual: string, expected: string): void {
  expect(actual, `got ${codePoints(actual)}, wanted ${codePoints(expected)}`).toBe(expected);
}

describe('Q34.02: LOCALE_ID and DEFAULT_CURRENCY_CODE', () => {
  let savedLocale: string | undefined;

  beforeEach(() => {
    savedLocale = $localize.locale;
  });

  afterEach(() => {
    $localize.locale = savedLocale;
  });

  it('Q34.02 LOCALE_ID is en-US with nothing configured, fr from $localize.locale, de from a provider; the currency stays USD', () => {
    $localize.locale = undefined;
    expect(TestBed.inject(LOCALE_ID)).toBe('en-US');

    // The root injector runs the token's factory once, so each case starts from a fresh TestBed.
    TestBed.resetTestingModule();
    $localize.locale = 'fr';
    expect(TestBed.inject(LOCALE_ID)).toBe('fr');
    expect(TestBed.inject(DEFAULT_CURRENCY_CODE)).toBe('USD');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] });
    expect(TestBed.inject(LOCALE_ID)).toBe('de');
  });
});

describe('Q34.06: Angular formatting functions versus Intl', () => {
  beforeEach(() => {
    registerLocaleData(localeFr);
    registerLocaleData(localeArEg);
  });

  it('Q34.06 en-US short time differs by U+202F against U+0020, ar-EG digits differ, and the fr currency string is identical', () => {
    const intlShort = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(instant);
    expectSame(formatDate(instant, 'short', 'en-US', 'UTC'), '7/8/24, 3:30\u202fPM');
    expectSame(intlShort, '7/8/24, 3:30\u0020PM');

    // ar-EG: Latin digits from Angular's data, Arabic-Indic digits (U+0660 to U+0669) from Node 24's Intl.
    expectSame(formatNumber(1234.5, 'ar-EG'), '1,234.5');
    expectSame(
      new Intl.NumberFormat('ar-EG').format(1234.5),
      '\u0661\u066c\u0662\u0663\u0664\u066b\u0665',
    );
    expectSame(formatDate(instant, 'mediumDate', 'ar-EG', 'UTC'), '08\u200f/07\u200f/2024');
    expectSame(
      new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeZone: 'UTC' }).format(instant),
      '\u0660\u0668\u200f/\u0660\u0667\u200f/\u0662\u0660\u0662\u0664',
    );

    const angular = formatCurrency(1234.5, 'fr', '\u20ac', 'EUR');
    expectSame(angular, '1\u202f234,50\u00a0\u20ac');
    expectSame(
      new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(1234.5),
      angular,
    );
  });
});

// The template stays on one line: Prettier's line breaks would become spaces inside the message.
// prettier-ignore
@Component({
  selector: 'lab-m34-q10-host',
  template: `<p i18n>Hi {{ name }}, you have <b>{{ count }}</b> items</p>`,
})
class LabM34Q10Host {
  protected readonly name = 'Ana';
  protected readonly count = 2;
}

describe('Q34.10: $localize without translations and the placeholder names of an element', () => {
  afterEach(() => clearTranslations());

  it('Q34.10 the call returns Hello, Ana! and the element message names INTERPOLATION, START_BOLD_TEXT, INTERPOLATION_1 and CLOSE_BOLD_TEXT', () => {
    const name = 'Ana';
    expect($localize.translate).toBeUndefined();
    expect($localize`:greeting|Opens the page@@m34.q10.greet:Hello, ${name}:name:!`).toBe(
      'Hello, Ana!',
    );

    const seen: ParsedMessage[] = [];
    $localize.translate = (parts, substitutions) => {
      seen.push(parseMessage(parts, substitutions));
      return [parts, substitutions];
    };
    TestBed.createComponent(LabM34Q10Host).detectChanges();

    expect(seen).toHaveLength(1);
    expect(seen[0].text).toBe(
      'Hi {$INTERPOLATION}, you have {$START_BOLD_TEXT}{$INTERPOLATION_1}{$CLOSE_BOLD_TEXT} items',
    );
    expect(seen[0].placeholderNames).toEqual([
      'INTERPOLATION',
      'START_BOLD_TEXT',
      'INTERPOLATION_1',
      'CLOSE_BOLD_TEXT',
    ]);
  });
});

// Both templates stay on one line each: Prettier's line breaks would become spaces inside the ICU message.
// prettier-ignore
@Component({
  selector: 'lab-m34-q13-host',
  imports: [I18nPluralPipe],
  template: `
    <p id="icu">{n(), plural, one {one item} other {{{ n() }} items}}</p>
    <p id="pipe">{{ n() | i18nPlural: { one: '# item', other: '# items' } }}</p>
    <p id="select">{category(), select, one {one item} other {{{ n() }} items}}</p>
  `,
})
class LabM34Q13Host {
  protected readonly n = signal(1.5);
  protected readonly category = signal(new Intl.PluralRules('en').select(1.5));
}

describe('Q34.13: an ICU plural, the i18nPlural pipe and Intl.PluralRules at 1.5', () => {
  it('Q34.13 the template ICU renders one item, the i18nPlural pipe 1.5 items, Intl.PluralRules selects other, and a select on that category renders 1.5 items', () => {
    const fixture = TestBed.createComponent(LabM34Q13Host);
    fixture.detectChanges();
    const text = (id: string): string => fixture.nativeElement.querySelector(id)?.textContent ?? '';

    expect(text('#icu')).toBe('one item');
    expect(text('#pipe')).toBe('1.5 items');
    expect(new Intl.PluralRules('en').select(1.5)).toBe('other');
    expect(text('#select')).toBe('1.5 items');
  });
});

// One component type per case: a type creates its messages once, at its first render, so the three cases cannot share one.
// Each template stays on one line: Prettier's line breaks would become spaces inside the message.
// prettier-ignore
@Component({
  selector: 'lab-m34-q20-before-host',
  template: `<p i18n="@@m34.q20.before">Hi {{ name }}, you have <b>{{ count }}</b> items</p>`,
})
class LabM34Q20BeforeHost {
  protected readonly name = 'Ana';
  protected readonly count = 2;
}

@Component({
  selector: 'lab-m34-q20-after-host',
  template: `<h1 i18n="@@m34.q20.after">Welcome back</h1>`,
})
class LabM34Q20AfterHost {}

@Component({
  selector: 'lab-m34-q20-missing-host',
  template: `<h1 i18n="@@m34.q20.missing">Welcome back</h1>`,
})
class LabM34Q20MissingHost {}

describe('Q34.20: runtime translations before bootstrap, after the first render, and missing', () => {
  afterEach(() => {
    clearTranslations();
    vi.restoreAllMocks();
  });

  function html(type: typeof LabM34Q20AfterHost | typeof LabM34Q20BeforeHost): string {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    return fixture.nativeElement.innerHTML;
  }

  it('Q34.20 a map loaded first translates and reorders, a map loaded after the first render changes nothing, and a missing message shows the source and logs one warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // Before: the map is full when the type first renders.
    loadTranslations({
      'm34.q20.before':
        '{$START_BOLD_TEXT}{$INTERPOLATION_1}{$CLOSE_BOLD_TEXT} articles pour {$INTERPOLATION}',
    });
    expect(html(LabM34Q20BeforeHost)).toBe('<p><b>2</b> articles pour Ana</p>');
    clearTranslations();

    // After: the first render ran without a map, so the type keeps English although the map is loaded later.
    expect(html(LabM34Q20AfterHost)).toBe('<h1>Welcome back</h1>');
    loadTranslations({ 'm34.q20.after': 'Bon retour' });
    expect(html(LabM34Q20AfterHost)).toBe('<h1>Welcome back</h1>');
    expect($localize`:@@m34.q20.after:Welcome back`).toBe('Bon retour');
    expect(warn).not.toHaveBeenCalled();
    clearTranslations();

    // Missing: the map holds another message, so this one shows its source and `translate` logs once.
    loadTranslations({ 'm34.q20.other': 'Autre' });
    expect(html(LabM34Q20MissingHost)).toBe('<h1>Welcome back</h1>');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/^No translation found for "m34\.q20\.missing"/);
  });
});

describe('Q34.24: Directionality after the html dir changes', () => {
  afterEach(() => document.documentElement.removeAttribute('dir'));

  it('Q34.24 Directionality keeps ltr after the html dir changes', () => {
    // `Directionality` (`@angular/cdk` 22.2.1) reads `document.body.dir || document.documentElement.dir` once, in its constructor.
    const early = TestBed.inject(Directionality);
    expect(early.value).toBe('ltr');

    document.documentElement.dir = 'rtl';
    expect(early.value).toBe('ltr');

    // A service created after the change reads the new value: the only difference is when it was constructed.
    TestBed.resetTestingModule();
    expect(TestBed.inject(Directionality).value).toBe('rtl');
  });
});
