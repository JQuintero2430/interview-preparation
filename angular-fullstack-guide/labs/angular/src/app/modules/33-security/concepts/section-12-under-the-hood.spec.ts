import { Component, Directive, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** A directive with no inputs: importing it is enough to switch the compiler to full mode. */
@Directive({ selector: '[labM33Mark]' })
class LabM33Mark {}

/** No directive dependencies: the compiler emits the DOM-only instruction set. */
@Component({ template: `<a [href]="url()" [title]="label()">link</a>` })
class LinkHost {
  readonly url = signal('https://example.test/a');
  readonly label = signal('<b>x</b>');
}

/** One imported directive: the compiler emits the full instruction set. */
@Component({ imports: [LabM33Mark], template: `<a labM33Mark [href]="url()">link</a>` })
class MarkedLinkHost {
  readonly url = signal('https://example.test/a');
}

/** Returns the source text of a component's compiled template function (internal `ɵcmp`, may change in any release). */
function templateSource(component: object): string {
  const def: unknown = Reflect.get(component, 'ɵcmp');
  const template: unknown = def !== null && typeof def === 'object' ? Reflect.get(def, 'template') : undefined;
  return typeof template === 'function' ? template.toString() : '';
}

describe('Section 12: under the hood', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Section 12: the compiled template passes a URL sanitizer with an href binding', () => {
    // The vitest transform prefixes imports (`__vite_ssr_import_1__.`), so the namespace is matched loosely.
    expect(templateSource(LinkHost)).toMatch(/ɵɵdomProperty\("href", ctx\.url\(\), [\w$]+\.ɵɵsanitizeUrl\)/);
    expect(templateSource(MarkedLinkHost)).toMatch(/ɵɵproperty\("href", ctx\.url\(\), [\w$]+\.ɵɵsanitizeUrl\)/);
  });

  it('Section 12: the compiled template passes no sanitizer with a title binding', () => {
    expect(templateSource(LinkHost)).toMatch(/\("title", ctx\.label\(\)\)/);

    const fixture = TestBed.createComponent(LinkHost);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('a')?.getAttribute('title')).toBe('<b>x</b>');
  });

  it('Section 12: the sanitizer runs again when the bound value changes', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(LinkHost);
    const href = (value: string) => {
      fixture.componentInstance.url.set(value);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('a')?.getAttribute('href');
    };

    expect(href('https://example.test/a')).toBe('https://example.test/a');
    expect(href('javascript:window.__m33Hits=1')).toBe('unsafe:javascript:window.__m33Hits=1');
    expect(href('https://example.test/b')).toBe('https://example.test/b');
  });
});
