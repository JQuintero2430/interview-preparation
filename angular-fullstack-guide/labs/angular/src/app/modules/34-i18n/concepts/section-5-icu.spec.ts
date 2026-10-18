import { I18nPluralPipe, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Section 5 claims: an ICU message picks its branch by an exact match, then by the locale's plural
// category, then `other`; the category comes from the locale data with the value truncated by `parseInt`,
// and a locale without registered data throws NG0701. The ICU is compiled with the template, so it needs
// no `@angular/localize` call here. `TestBed` sets the global locale id from `LOCALE_ID` and resets it
// after each test (read: `@angular/core` 22.2.1, `fesm2022/testing.mjs`).
@Component({
  selector: 'lab-m34-exact-host',
  template: `<p>{n(), plural, =0 {none} zero {zero category} one {one} other {other}}</p>`,
})
class LabM34ExactHost {
  readonly n = signal(0);
}

@Component({
  selector: 'lab-m34-fallback-host',
  template: `<p>{n(), plural, one {one} other {other}}</p>`,
})
class LabM34FallbackHost {
  readonly n = signal(3);
}

@Component({
  selector: 'lab-m34-select-host',
  template: `<p>{gender(), select, female {She} male {He} other {They}}</p>`,
})
class LabM34SelectHost {
  readonly gender = signal('female');
}

@Component({
  selector: 'lab-m34-nested-host',
  template: `<p>{gender(), select, female {{count(), plural, =1 {She has one photo} other {She has {{ count() }} photos}}} other {{count(), plural, =1 {They have one photo} other {They have {{ count() }} photos}}}}</p>`,
})
class LabM34NestedHost {
  readonly gender = signal('female');
  readonly count = signal(1);
}

@Component({
  selector: 'lab-m34-truncate-host',
  imports: [I18nPluralPipe],
  template: `
    <p id="icu">{n(), plural, one {one item} other {{{ n() }} items}}</p>
    <p id="pipe">{{ n() | i18nPlural: { one: '# item', other: '# items' } }}</p>
  `,
})
class LabM34TruncateHost {
  readonly n = signal(1.5);
}

@Component({
  selector: 'lab-m34-nodata-host',
  template: `<p>{n(), plural, one {one} other {other}}</p>`,
})
class LabM34NoDataHost {
  readonly n = signal(1);
}

function text(fixture: { nativeElement: HTMLElement }, selector = 'p'): string {
  return fixture.nativeElement.querySelector(selector)?.textContent ?? '';
}

describe('Section 5: ICU expressions', () => {
  it('Section 5: an exact =0 case wins over the category', () => {
    registerLocaleData(localeAr);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'ar' }] });
    const fixture = TestBed.createComponent(LabM34ExactHost);

    fixture.detectChanges();

    // In Arabic 0 is the `zero` category, and the exact case still wins.
    expect(text(fixture)).toBe('none');
  });

  it('Section 5: a missing category falls back to other', () => {
    registerLocaleData(localeAr);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'ar' }] });
    const fixture = TestBed.createComponent(LabM34FallbackHost);

    fixture.detectChanges();

    // In Arabic 3 is the `few` category, which the message does not have.
    expect(text(fixture)).toBe('other');
  });

  it('Section 5: a select expression picks the branch by value', () => {
    const fixture = TestBed.createComponent(LabM34SelectHost);
    const seen: string[] = [];

    for (const gender of ['female', 'male', 'nonbinary']) {
      fixture.componentInstance.gender.set(gender);
      fixture.detectChanges();
      seen.push(text(fixture));
    }

    expect(seen).toEqual(['She', 'He', 'They']);
  });

  it('Section 5: a nested select and plural render together', () => {
    const fixture = TestBed.createComponent(LabM34NestedHost);
    const seen: string[] = [];

    for (const [gender, count] of [['female', 1], ['female', 3], ['male', 4]] as const) {
      fixture.componentInstance.gender.set(gender);
      fixture.componentInstance.count.set(count);
      fixture.detectChanges();
      seen.push(text(fixture));
    }

    expect(seen).toEqual(['She has one photo', 'She has 3 photos', 'They have 4 photos']);
  });

  it('Section 5: an ICU plural treats 1.5 as one in English', () => {
    const fixture = TestBed.createComponent(LabM34TruncateHost);

    fixture.detectChanges();

    expect(text(fixture, '#icu')).toBe('one item');
    expect(text(fixture, '#pipe')).toBe('1.5 items');
    expect(new Intl.PluralRules('en').select(1.5)).toBe('other');
  });

  it('Section 5: an ICU plural under a locale without data throws NG0701', () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'fr' }] });
    const fixture = TestBed.createComponent(LabM34NoDataHost);

    expect(() => fixture.detectChanges()).toThrowError(/NG0701: Missing locale data for the locale "fr"/);
  });
});
