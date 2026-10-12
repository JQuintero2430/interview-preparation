import { Component, Type, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// One fixture per mode and per rewrite group; selectors and templates are unique (specs are not shared modules).
@Component({
  selector: 'lab-enc-emulated',
  template: `<h2>Title</h2>`,
  styles: `
    h2 {
      color: teal;
    }
  `,
})
class EmulatedBox {}

@Component({
  selector: 'lab-enc-none',
  template: `<h3>Title</h3>`,
  encapsulation: ViewEncapsulation.None,
  styles: `
    :host {
      display: block;
    }
    h3 {
      color: red;
    }
  `,
})
class NoneBox {}

@Component({
  selector: 'lab-enc-shadow',
  template: `<h4>Title</h4>`,
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: `
    h4 {
      color: navy;
    }
  `,
})
class ShadowBox {}

@Component({
  selector: 'lab-enc-isolated',
  template: `<h5>Title</h5>`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  styles: `
    h5 {
      color: navy;
    }
  `,
})
class IsolatedBox {}

@Component({
  selector: 'lab-enc-unstyled',
  template: `<h6>Title</h6>`,
})
class UnstyledBox {}

// Each styles entry becomes its own head style element, so one rule maps to one observed text.
@Component({
  selector: 'lab-enc-table',
  template: `<p>Text</p>`,
  styles: [
    `:host { display: block; }`,
    `:host(.on) p { color: red; }`,
    `:host > p { color: red; }`,
    `:host-context(.dark) p { color: white; }`,
    `:host-context(.dark) { color: white; }`,
    `.a ::ng-deep .b { color: red; }`,
    `::ng-deep .b { color: red; }`,
    `:host ::ng-deep .b { color: red; }`,
    `p ::ng-deep a { color: red; }`,
    `.a .b > c + d ~ e { color: red; }`,
    `a:hover, b::before { color: red; }`,
    `p:not(.x) { color: red; }`,
    `@media (min-width: 1px) { p { color: red; } }`,
    `@layer base { p { color: red; } }`,
    `@container (min-width: 1px) { p { color: red; } }`,
  ],
})
class RewriteTable {}

@Component({
  selector: 'lab-enc-nothing',
  template: `<p>Text</p>`,
  styles: [
    `html, body { margin: 0; }`,
    `:root { --tone: red; }`,
    `:host(.a, .b) { color: red; }`,
    `::part(foo) { color: red; }`,
  ],
})
class MatchesNothing {}

@Component({
  selector: 'lab-enc-keyframes',
  template: `<p class="spin">Text</p>`,
  styles: `
    @keyframes spin {
      to {
        opacity: 0;
      }
    }
    .spin {
      animation: spin 1s;
    }
  `,
})
class KeyframeBox {}

// Nested CSS is lowered by the build before Angular sees an inline style, so this fixture is compiled at run time
// (JIT) from the styles as written: that path hands the text to Angular's own CSS rewriter untouched.
function nestedBox(): Type<unknown> {
  class NestedBox {}
  Component({
    selector: 'lab-enc-nested',
    template: `<p class="a"><span class="b">Text</span></p>`,
    styles: [
      `.a { .b { color: red; } }`,
      `.a { &:hover { color: red; } }`,
      `:host { .b { color: red; } }`,
      `:host ::ng-deep { .foo { color: red; } }`,
    ],
  })(NestedBox);
  return NestedBox;
}

@Component({
  selector: 'lab-enc-button',
  template: `<button class="btn">Go</button>`,
  styles: `
    .btn {
      color: green;
    }
    :host-context(.dark) .btn {
      background-color: black;
    }
  `,
})
class ButtonBox {}

// The same nested rule written as an ordinary inline style, so the test build handles it first.
@Component({
  selector: 'lab-enc-lowered',
  template: `<p class="a"><span class="b">Text</span></p>`,
  styles: `
    .a {
      .b {
        color: red;
      }
    }
  `,
})
class LoweredBox {}

function headStyleTexts(): string[] {
  return Array.from(document.head.querySelectorAll('style')).map((element) => element.textContent ?? '');
}

// The style elements a fixture added to the head, in order, with whitespace, ids and dev comments normalized.
function addedStyles(type: Type<unknown>, keep: () => void = () => undefined): string[] {
  const before = new Set(Array.from(document.head.querySelectorAll('style')));
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  keep();
  const added = Array.from(document.head.querySelectorAll('style')).filter((element) => !before.has(element));
  fixture.destroy();
  return added.map((element) => normalize(element.textContent ?? ''));
}

function normalize(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/_ng(content|host)-a-c\d+/g, '_ng$1-a-cN')
    .replace(/\s+/g, ' ')
    .trim();
}

function ngAttributes(element: Element): string[] {
  return element
    .getAttributeNames()
    .filter((name) => name.startsWith('_ng'))
    .map((name) => name.replace(/-c\d+$/, '-cN'));
}

function suffix(element: Element, prefix: string): string {
  const name = element.getAttributeNames().find((attribute) => attribute.startsWith(prefix));
  return name?.slice(prefix.length) ?? 'missing';
}

describe('Section 9: view encapsulation', () => {
  it('Section 9: Emulated adds a host attribute and a content attribute that share one suffix', () => {
    const fixture = TestBed.createComponent(EmulatedBox);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const heading = host.querySelector('h2');
    expect(heading).not.toBeNull();

    expect(ngAttributes(host)).toEqual(['_nghost-a-cN']);
    expect(ngAttributes(heading as Element)).toEqual(['_ngcontent-a-cN']);
    expect(suffix(host, '_nghost-')).toBe(suffix(heading as Element, '_ngcontent-'));
    expect(host.shadowRoot).toBeNull();
  });

  it('Section 9: Emulated rewrites :host, :host-context and ::ng-deep as documented', () => {
    const rewritten = addedStyles(RewriteTable);
    // Observed pairs; `_NC` stands for [_ngcontent-a-cN] and `_NH` for [_nghost-a-cN].
    const NC = '[_ngcontent-a-cN]';
    const NH = '[_nghost-a-cN]';
    expect(rewritten).toEqual([
      `${NH} { display: block; }`,
      `.on${NH} p${NC} { color: red; }`,
      `${NH} > p${NC} { color: red; }`,
      `.dark${NH} p${NC}, .dark ${NH} p${NC} { color: white; }`,
      `.dark${NH}, .dark ${NH} { color: white; }`,
      `.a${NC} .b { color: red; }`,
      `.b { color: red; }`,
      `${NH} .b { color: red; }`,
      `p${NC} a { color: red; }`,
      `.a${NC} .b${NC} > c${NC} + d${NC} ~ e${NC} { color: red; }`,
      `a${NC}:hover, b${NC}::before { color: red; }`,
      `p${NC}:not(.x) { color: red; }`,
      `@media (min-width: 1px) { p${NC} { color: red; } }`,
      `@layer base { p${NC} { color: red; } }`,
      `@container (min-width: 1px) { p${NC} { color: red; } }`,
    ]);
  });

  it('Section 9: :host-context(.dark) applies when an ancestor carries the class', () => {
    const fixture = TestBed.createComponent(ButtonBox);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLElement;
    expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(0, 0, 0)');

    document.body.classList.add('dark');
    try {
      expect(getComputedStyle(button).backgroundColor).toBe('rgb(0, 0, 0)');
    } finally {
      document.body.classList.remove('dark');
    }
  });

  it('Section 9: None adds no attributes and leaves :host untouched in the style text', () => {
    const fixture = TestBed.createComponent(NoneBox);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    expect(ngAttributes(host)).toEqual([]);
    expect(ngAttributes(host.querySelector('h3') as Element)).toEqual([]);
    const text = headStyleTexts().map(normalize).find((style) => style.includes('h3'));
    expect(text).toBe(':host { display: block; } h3 { color: red; }');

    fixture.destroy();
    expect(headStyleTexts().map(normalize)).not.toContain(text);
  });

  it('Section 9: ShadowDom attaches a shadow root, puts the styles in it and none in the document head', () => {
    const before = headStyleTexts().length;
    const fixture = TestBed.createComponent(ShadowBox);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const root = host.shadowRoot;

    expect(root).not.toBeNull();
    expect(root?.mode).toBe('open');
    expect(root?.querySelector('h4')).not.toBeNull();
    expect(host.querySelector('h4')).toBeNull();
    expect(normalize(root?.querySelector('style')?.textContent ?? '')).toBe('h4 { color: navy; }');
    expect(headStyleTexts()).toHaveLength(before);
    expect(ngAttributes(host)).toEqual([]);
  });

  it('Section 9: ExperimentalIsolatedShadowDom also uses a shadow root', () => {
    const before = headStyleTexts().length;
    const fixture = TestBed.createComponent(IsolatedBox);
    fixture.detectChanges();
    const root = (fixture.nativeElement as HTMLElement).shadowRoot;

    expect(root).not.toBeNull();
    expect(root?.querySelector('h5')).not.toBeNull();
    expect(normalize(root?.querySelector('style')?.textContent ?? '')).toBe('h5 { color: navy; }');
    expect(headStyleTexts()).toHaveLength(before);
  });

  it('Section 9: Emulated with no styles switches to None', () => {
    const before = headStyleTexts().length;
    const fixture = TestBed.createComponent(UnstyledBox);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    expect(ngAttributes(host)).toEqual([]);
    expect(ngAttributes(host.querySelector('h6') as Element)).toEqual([]);
    expect(headStyleTexts()).toHaveLength(before);
  });

  it('Section 9: keyframe names are renamed per component', () => {
    const [style] = addedStyles(KeyframeBox);
    expect(style).toBe(
      '@keyframes _ngcontent-a-cN_spin { to { opacity: 0; } } .spin[_ngcontent-a-cN] { animation: _ngcontent-a-cN_spin 1s; }',
    );
  });

  it('Section 9: html, :root and :host(.a, .b) are rewritten into selectors that match nothing', () => {
    const NC = '[_ngcontent-a-cN]';
    expect(addedStyles(MatchesNothing)).toEqual([
      `html${NC}, body${NC} { margin: 0; }`,
      `${NC}:root { --tone: red; }`,
      `${NC}:host(.a, .b) { color: red; }`,
      `${NC}::part(foo) { color: red; }`,
    ]);
  });

  it('Section 9: nested rules are scoped', () => {
    const NC = '[_ngcontent-a-cN]';
    const NH = '[_nghost-a-cN]';
    expect(addedStyles(nestedBox())).toEqual([
      `.a${NC} { .b${NC} { color: red; } }`,
      `.a${NC} { &${NC}:hover { color: red; } }`,
      `${NH} { .b${NC} { color: red; } }`,
      `${NH} { .foo { color: red; } }`,
    ]);
  });

  it('Section 9: the test build flattens nested CSS in an inline style before Angular scopes it', () => {
    expect(addedStyles(LoweredBox)).toEqual(['.a[_ngcontent-a-cN] .b[_ngcontent-a-cN] { color: red; }']);
  });

  it('Section 9: a global rule reaches into an Emulated component and the scoped rule wins a clash', () => {
    const global = document.createElement('style');
    global.textContent = '.btn { color: red; font-style: italic; }';
    document.head.append(global);
    try {
      const fixture = TestBed.createComponent(ButtonBox);
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLElement;

      expect(getComputedStyle(button).fontStyle).toBe('italic');
      expect(getComputedStyle(button).color).toBe('rgb(0, 128, 0)');
    } finally {
      global.remove();
    }
  });
});
