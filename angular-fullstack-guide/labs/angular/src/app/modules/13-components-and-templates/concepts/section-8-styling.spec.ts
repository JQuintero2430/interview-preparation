import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InlineCard, StyledCard } from './styled-card';

// A parent with no styles: the paragraph is outside the card's template.
@Component({
  selector: 'lab-reach-host',
  imports: [InlineCard],
  template: `
    <lab-inline-card />
    <p id="outside" class="inline-title">Outside the card</p>
  `,
})
class ReachHost {}

// Style elements in the head whose text contains the marker, with generated ids and whitespace normalized.
function headStyles(marker: string): string[] {
  return Array.from(document.head.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .filter((text) => text.includes(marker))
    .map((text) => text.replace(/_ng(content|host)-a-c\d+/g, '_ng$1-a-cN').replace(/\s+/g, ' ').trim());
}

function first(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element for ${selector}`);
  }
  return found;
}

function attributeNames(element: Element): string[] {
  return element.getAttributeNames().map((name) => name.replace(/-c\d+$/, '-cN'));
}

describe('Section 8: styling strategies', () => {
  const global = document.createElement('style');

  afterEach(() => global.remove());

  it('Section 8: component styles are added once per component type and removed with the last instance', () => {
    expect(headStyles('inline-title')).toHaveLength(0);

    const one = TestBed.createComponent(InlineCard);
    const two = TestBed.createComponent(InlineCard);
    one.detectChanges();
    two.detectChanges();
    expect(headStyles('inline-title')).toHaveLength(1);

    one.destroy();
    expect(headStyles('inline-title')).toHaveLength(1);

    two.destroy();
    expect(headStyles('inline-title')).toHaveLength(0);
  });

  it('Section 8: styles, styleUrl and a style element in the template are scoped alike', () => {
    const card = TestBed.createComponent(StyledCard);
    const inline = TestBed.createComponent(InlineCard);
    card.detectChanges();
    inline.detectChanges();
    const host: HTMLElement = card.nativeElement;

    // styleUrl and the template's style element each become a head style, selectors rewritten.
    expect(headStyles('card-title')).toEqual([
      '[_nghost-a-cN] { display: block; } .card-title[_ngcontent-a-cN] { color: var(--card-tone, teal); }',
    ]);
    expect(headStyles('card-note')).toEqual(['.card-note[_ngcontent-a-cN] { font-style: italic; }']);
    // styles written in the metadata are rewritten the same way.
    expect(headStyles('inline-title')).toEqual(['.inline-title[_ngcontent-a-cN] { color: teal; }']);

    // The style element left the template; the elements carry the generated attribute instead.
    expect(host.querySelector('style')).toBeNull();
    expect(attributeNames(first(host, '.card-title'))).toContain('_ngcontent-a-cN');
    expect(attributeNames(host)).toContain('_nghost-a-cN');
  });

  it('Section 8: a host binding sets a custom property on the host', () => {
    const fixture = TestBed.createComponent(StyledCard);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--card-tone')).toBe('teal');

    fixture.componentRef.setInput('tone', 'coral');
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--card-tone')).toBe('coral');
  });

  it('Section 8: a global rule reaches into an Emulated component but a component rule stays inside it', () => {
    const fixture = TestBed.createComponent(ReachHost);
    fixture.detectChanges();
    const inside = first(fixture.nativeElement, 'lab-inline-card .inline-title');
    const outside = first(fixture.nativeElement, '#outside');

    // The card's own rule colors its heading and not the same class outside it.
    expect(getComputedStyle(inside).color).toBe('rgb(0, 128, 128)');
    expect(getComputedStyle(outside).color).not.toBe('rgb(0, 128, 128)');

    // A plain rule in a global style element reaches both.
    global.textContent = '.inline-title { font-style: italic; }';
    document.head.append(global);
    expect(getComputedStyle(inside).fontStyle).toBe('italic');
    expect(getComputedStyle(outside).fontStyle).toBe('italic');
  });
});
