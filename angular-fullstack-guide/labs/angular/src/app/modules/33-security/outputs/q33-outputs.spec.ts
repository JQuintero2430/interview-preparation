// Output questions of module 33 that run under `ng test` (jsdom, development mode). Each test is named after its question ID.
import { Component, SecurityContext, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeValue } from '@angular/platform-browser';

const SEE = 'see https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss';
const FRAME = 'https://example.test/frame';

@Component({ template: `<a [href]="value">link</a>` })
class HtmlInHrefHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustHtml('<b>x</b>');
}

@Component({ template: `<a [href]="value">link</a>` })
class ResourceUrlInHrefHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustResourceUrl('javascript:window.__m33Hits=1');
}

@Component({ template: `<iframe [src]="value"></iframe>` })
class UrlInFrameHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustUrl(FRAME);
}

/** Renders a component and returns its root element. */
function render(host: new () => object): HTMLElement {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Module 33 output questions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Q33.07 the sanitizer drops script, handlers, style, id and svg, and prefixes only javascript: URLs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sanitizer = TestBed.inject(DomSanitizer);
    const html = (value: string) => sanitizer.sanitize(SecurityContext.HTML, value);
    const url = (value: string) => sanitizer.sanitize(SecurityContext.URL, value);

    expect(html('a<script>window.__m33Hits=1</script>b')).toBe('ab');
    expect(html('<img src="x" onerror="window.__m33Hits=1">')).toBe('<img src="x">');
    expect(html('<p style="color:red" id="i" class="c">t</p>')).toBe('<p class="c">t</p>');
    expect(html('<svg><circle/></svg>')).toBe('');
    expect(url('javascript:alert(1)')).toBe('unsafe:javascript:alert(1)');
    expect(url(' javascript:alert(1)')).toBe('unsafe: javascript:alert(1)');
    expect(url('data:text/html,<b>x</b>')).toBe('data:text/html,<b>x</b>');
    // Development mode: every call that changed something warned (4 HTML values, 2 URLs); the data: URL did not.
    expect(warn).toHaveBeenCalledTimes(6);
  });

  it('Q33.10 a safe value works only in its own context, and sanitize unwraps a matching one', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sanitizer = TestBed.inject(DomSanitizer);

    expect(() => render(HtmlInHrefHost)).toThrowError(`Required a safe URL, got a HTML (${SEE})`);
    expect(render(ResourceUrlInHrefHost).querySelector('a')?.getAttribute('href')).toBe('javascript:window.__m33Hits=1');
    expect(() => render(UrlInFrameHost)).toThrowError(`Required a safe ResourceURL, got a URL (${SEE})`);
    expect(sanitizer.sanitize(SecurityContext.HTML, sanitizer.bypassSecurityTrustHtml('<script>x</script><b>x</b>'))).toBe('<script>x</script><b>x</b>');
  });
});
