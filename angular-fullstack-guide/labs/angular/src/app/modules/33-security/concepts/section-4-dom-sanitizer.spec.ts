import { Component, SecurityContext, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeValue } from '@angular/platform-browser';

const FRAME = 'https://example.test/frame';

@Component({ template: `<iframe [src]="value"></iframe>` })
class BoundFrameHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustResourceUrl(FRAME);
}

@Component({ template: `<iframe src="https://example.test/static"></iframe>` })
class StaticFrameHost {}

@Component({ template: `<a [href]="value">link</a>` })
class LinkHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustHtml('<b>x</b>');
}

@Component({ template: `<p>{{ value }}</p>` })
class TextHost {
  value: SafeValue = inject(DomSanitizer).bypassSecurityTrustHtml('<b>x</b>');
}

/** Renders a component and returns its root element. */
function render(host: new () => object): HTMLElement {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Section 4: DomSanitizer and the bypass methods', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Section 4: a trusted resource URL renders in an iframe src', () => {
    expect(render(BoundFrameHost).querySelector('iframe')?.getAttribute('src')).toBe(FRAME);
  });

  it('Section 4: a static iframe src needs no bypass', () => {
    expect(render(StaticFrameHost).querySelector('iframe')?.getAttribute('src')).toBe('https://example.test/static');
  });

  it('Section 4: a SafeHtml bound to a URL context throws', () => {
    expect(() => render(LinkHost)).toThrowError(/Required a safe URL, got a HTML \(see https:\/\/angular\.dev\/best-practices\/security#preventing-cross-site-scripting-xss\)/);
  });

  it('Section 4: a SafeResourceUrl is accepted where a URL is required', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const host = TestBed.createComponent(LinkHost);
    host.componentInstance.value = sanitizer.bypassSecurityTrustResourceUrl('javascript:window.__m33Hits=1');
    host.detectChanges();

    expect((host.nativeElement as HTMLElement).querySelector('a')?.getAttribute('href')).toBe('javascript:window.__m33Hits=1');
  });

  it('Section 4: sanitize unwraps a matching safe value and cleans a plain HTML string', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sanitizer = TestBed.inject(DomSanitizer);

    expect(sanitizer.sanitize(SecurityContext.HTML, sanitizer.bypassSecurityTrustHtml('<script>x</script><b>x</b>'))).toBe('<script>x</script><b>x</b>');
    expect(sanitizer.sanitize(SecurityContext.HTML, '<script>x</script><b>x</b>')).toBe('<b>x</b>');
  });

  it('Section 4: sanitize throws for a plain string in the resource URL context', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sanitizer = TestBed.inject(DomSanitizer);

    expect(() => sanitizer.sanitize(SecurityContext.RESOURCE_URL, FRAME)).toThrowError('NG05201: unsafe value used in a resource URL context');
    // The typings comment says every non-HTML context throws; the code does not.
    expect(sanitizer.sanitize(SecurityContext.URL, 'javascript:alert(1)')).toBe('unsafe:javascript:alert(1)');
    expect(sanitizer.sanitize(SecurityContext.STYLE, 'url("javascript:alert(1)")')).toBe('url("javascript:alert(1)")');
    expect(() => sanitizer.sanitize(SecurityContext.SCRIPT, 'alert(1)')).toThrowError(/unsafe value used in a script context/);
  });

  it('Section 4: a safe value interpolated as text prints its warning string', () => {
    expect(render(TextHost).querySelector('p')?.textContent).toBe(
      'SafeValue must use [property]=binding: <b>x</b> (see https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss)',
    );
  });
});
