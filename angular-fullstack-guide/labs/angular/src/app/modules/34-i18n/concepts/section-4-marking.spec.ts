/// <reference types="@angular/localize" />
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clearTranslations, loadTranslations, ɵparseMessage as parseMessage, ɵParsedMessage as ParsedMessage } from '@angular/localize';

// Section 4 claims: marking text turns it into a message (text, placeholders, metadata) and a template
// message and a `$localize` call in code are the same kind of thing. `ng test` adds `@angular/localize/init`
// itself (HOUSE-31), so nothing here imports it. `ɵparseMessage` is internal and may change in any release.
// A compiled template creates its messages once per component type, so each test owns one host type, and
// every test clears the translations it installed (`clearTranslations()` also removes `$localize.translate`).
function recordMessages(): ParsedMessage[] {
  const seen: ParsedMessage[] = [];
  $localize.translate = (parts, substitutions) => {
    seen.push(parseMessage(parts, substitutions));
    return [parts, substitutions];
  };
  return seen;
}

@Component({
  selector: 'lab-m34-header-host',
  template: `<h1 i18n="site header|An introduction header@@m34.marking.header">Hello i18n!</h1>`,
})
class LabM34HeaderHost {}

@Component({
  selector: 'lab-m34-bold-host',
  template: `<p i18n>Hi {{ name }}, you have <b>{{ count }}</b> items</p>`,
})
class LabM34BoldHost {
  protected readonly name = 'Ana';
  protected readonly count = 2;
}

@Component({
  selector: 'lab-m34-title-host',
  template: `<button title="Close the dialog" i18n-title="dialog action|Tooltip of the close button@@m34.marking.close-title">x</button>`,
})
class LabM34TitleHost {}

describe('Section 4: marking text for translation', () => {
  afterEach(() => clearTranslations());

  it('Section 4: $localize without translations returns the text without its metadata', () => {
    expect($localize.translate).toBeUndefined();
    expect($localize`:site header|An introduction header@@m34.marking.header:Hello i18n!`).toBe('Hello i18n!');
    expect($localize`:An introduction header:Hello i18n!`).toBe('Hello i18n!');
  });

  it('Section 4: a named placeholder in $localize keeps its value', () => {
    const thanks = (giver: string, receiver: string) =>
      $localize`:@@m34.marking.thanks:${giver}:giver: thanked ${receiver}:receiver:`;

    expect(thanks('Ana', 'Luis')).toBe('Ana thanked Luis');

    loadTranslations({ 'm34.marking.thanks': '{$receiver} a été remercié par {$giver}' });

    expect(thanks('Ana', 'Luis')).toBe('Luis a été remercié par Ana');
  });

  it('Section 4: the i18n message of an element carries its meaning, description and custom ID', () => {
    const seen = recordMessages();
    const fixture = TestBed.createComponent(LabM34HeaderHost);
    fixture.detectChanges();

    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual(
      expect.objectContaining({
        id: 'm34.marking.header',
        customId: 'm34.marking.header',
        meaning: 'site header',
        description: 'An introduction header',
        text: 'Hello i18n!',
      }),
    );
    expect(fixture.nativeElement.textContent).toBe('Hello i18n!');
  });

  it('Section 4: an interpolation and a bold element become named placeholders', () => {
    const seen = recordMessages();
    const fixture = TestBed.createComponent(LabM34BoldHost);
    fixture.detectChanges();

    expect(seen).toHaveLength(1);
    expect(seen[0].placeholderNames).toEqual(['INTERPOLATION', 'START_BOLD_TEXT', 'INTERPOLATION_1', 'CLOSE_BOLD_TEXT']);
    expect(seen[0].text).toBe('Hi {$INTERPOLATION}, you have {$START_BOLD_TEXT}{$INTERPOLATION_1}{$CLOSE_BOLD_TEXT} items');
    expect(seen[0].id).toMatch(/^\d+$/);
    expect(fixture.nativeElement.innerHTML).toBe('<p>Hi Ana, you have <b>2</b> items</p>');
  });

  it('Section 4: an i18n-title attribute becomes its own message', () => {
    const seen = recordMessages();
    const fixture = TestBed.createComponent(LabM34TitleHost);
    fixture.detectChanges();

    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual(
      expect.objectContaining({
        id: 'm34.marking.close-title',
        meaning: 'dialog action',
        description: 'Tooltip of the close button',
        text: 'Close the dialog',
      }),
    );
    expect(fixture.nativeElement.querySelector('button').getAttribute('title')).toBe('Close the dialog');
  });
});
