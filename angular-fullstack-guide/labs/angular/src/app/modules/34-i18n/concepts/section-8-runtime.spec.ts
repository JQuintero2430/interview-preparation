/// <reference types="@angular/localize" />
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clearTranslations, loadTranslations } from '@angular/localize';

// Section 8 claims: `loadTranslations` fills the map `$localize` reads, a component type resolves its messages
// when it is first created, a miss warns and shows the source text, and a mismatched placeholder is reported.
// Each timing test owns its component type, because a type creates its messages once. `ng test` adds
// `@angular/localize/init` itself (HOUSE-31), and every test clears what it installed.

@Component({
  selector: 'lab-m34-before-host',
  template: `<h1 i18n="@@m34.runtime-spec.before">Welcome back</h1>`,
})
class LabM34BeforeHost {}

@Component({
  selector: 'lab-m34-reorder-host',
  template: `<p i18n="@@m34.runtime-spec.reorder">Hi {{ name }}, you have <b>{{ count }}</b> items</p>`,
})
class LabM34ReorderHost {
  protected readonly name = 'Ana';
  protected readonly count = 2;
}

@Component({
  selector: 'lab-m34-after-host',
  template: `<h1 i18n="@@m34.runtime-spec.after">Welcome back</h1>`,
})
class LabM34AfterHost {}

@Component({
  selector: 'lab-m34-missing-host',
  template: `<h1 i18n="@@m34.runtime-spec.missing">Welcome back</h1>`,
})
class LabM34MissingHost {}

@Component({
  selector: 'lab-m34-mismatch-host',
  template: `<h1 i18n="@@m34.runtime-spec.mismatch">Welcome back</h1>`,
})
class LabM34MismatchHost {}

function render(type: typeof LabM34BeforeHost): string {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture.nativeElement.innerHTML;
}

describe('Section 8: runtime translation with @angular/localize', () => {
  afterEach(() => {
    clearTranslations();
    vi.restoreAllMocks();
  });

  it('Section 8: translations loaded before the first render translate the template', () => {
    loadTranslations({ 'm34.runtime-spec.before': 'Bon retour' });

    expect(render(LabM34BeforeHost)).toBe('<h1>Bon retour</h1>');
  });

  it('Section 8: a translation can reorder placeholders', () => {
    loadTranslations({
      'm34.runtime-spec.reorder': '{$START_BOLD_TEXT}{$INTERPOLATION_1}{$CLOSE_BOLD_TEXT} articles pour {$INTERPOLATION}',
    });

    expect(render(LabM34ReorderHost)).toBe('<p><b>2</b> articles pour Ana</p>');
  });

  it('Section 8: translations loaded after the first render do not change the component', () => {
    expect(render(LabM34AfterHost)).toBe('<h1>Welcome back</h1>');

    loadTranslations({ 'm34.runtime-spec.after': 'Bon retour' });

    expect(render(LabM34AfterHost)).toBe('<h1>Welcome back</h1>');
    expect($localize`:@@m34.runtime-spec.after:Welcome back`).toBe('Bon retour');
  });

  it('Section 8: a missing translation logs a warning and renders the source text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    loadTranslations({ 'm34.runtime-spec.other': 'Autre' });

    expect(render(LabM34MissingHost)).toBe('<h1>Welcome back</h1>');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/^No translation found for "m34\.runtime-spec\.missing"/);
  });

  it('Section 8: a translation that names an unknown placeholder logs the mismatch and renders the source text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    loadTranslations({ 'm34.runtime-spec.mismatch': 'Bon retour {$NOPE}' });

    expect(render(LabM34MismatchHost)).toBe('<h1>Welcome back</h1>');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/^There is a placeholder name mismatch with the translation provided for the message/);
  });
});
