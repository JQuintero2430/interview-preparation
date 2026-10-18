import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** Hostile values for each context. The handlers only count; nothing here is ever clicked. */
const HTML =
  '<b>hi</b><script>window.__m33Hits=1</script><img src="x" onerror="window.__m33Hits=1"><a href="javascript:window.__m33Hits=1">x</a>';
const HTML_STYLED = '<style>p{color:red}</style><p style="color:red" class="c" id="i" data-x="1">t</p>';
const HTML_DROPPED = '<svg><circle/></svg><form action="x"><input></form><iframe src="x"></iframe><template><b>t</b></template>';

@Component({ template: `<p [innerHTML]="value()"></p>` })
class HtmlHost {
  readonly value = signal(HTML);
}

@Component({ template: `<a [href]="value()">link</a>` })
class UrlHost {
  readonly value = signal('');
}

@Component({ template: `<iframe [src]="value()"></iframe>` })
class ResourceUrlHost {
  readonly value = signal('https://example.test/frame');
}

@Component({ template: `<iframe [attr.sandbox]="value()"></iframe>` })
class SandboxHost {
  readonly value = signal('allow-scripts');
}

@Component({ template: `<p [style.background-image]="value()">styled</p>` })
class StyleHost {
  readonly value = signal('url("javascript:window.__m33Hits=1")');
}

/** Renders a host with one value and returns its root element. */
function render<T extends { value: { set(value: string): void } }>(host: new () => T, value: string): HTMLElement {
  const fixture = TestBed.createComponent(host);
  fixture.componentInstance.value.set(value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Section 3: sanitization by security context', () => {
  afterEach(() => vi.restoreAllMocks());

  it('Section 3: the HTML sanitizer keeps formatting and drops scripts, handlers, styles and ids', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(render(HtmlHost, HTML).querySelector('p')?.innerHTML).toBe('<b>hi</b><img src="x"><a href="unsafe:javascript:window.__m33Hits=1">x</a>');
    expect(render(HtmlHost, HTML_STYLED).querySelector('p')?.innerHTML).toBe('<p class="c">t</p>');
    expect(render(HtmlHost, HTML_DROPPED).querySelector('p')?.innerHTML).toBe('');
  });

  it('Section 3: a javascript: URL gets the unsafe: prefix in an href binding', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const href = (value: string) => render(UrlHost, value).querySelector('a')?.getAttribute('href');

    expect(href('javascript:alert(1)')).toBe('unsafe:javascript:alert(1)');
    expect(href('JaVaScRiPt:alert(1)')).toBe('unsafe:JaVaScRiPt:alert(1)');
    expect(href(' javascript:alert(1)')).toBe('unsafe: javascript:alert(1)');
    expect(href('https://example.test/a?b=1')).toBe('https://example.test/a?b=1');
    expect(href('/relative?q')).toBe('/relative?q');
    expect(href('mailto:a@example.test')).toBe('mailto:a@example.test');
  });

  it('Section 3: a data:text/html URL passes the 22.2.1 URL sanitizer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const href = (value: string) => render(UrlHost, value).querySelector('a')?.getAttribute('href');

    // The 22.2.1 CHANGELOG says "block dangerous data: and vbscript: URLs"; the shipped pattern refuses only javascript:.
    expect(href('data:text/html,<b>x</b>')).toBe('data:text/html,<b>x</b>');
    expect(href('vbscript:msgbox(1)')).toBe('vbscript:msgbox(1)');
    expect(warn).not.toHaveBeenCalled();
  });

  it('Section 3: an iframe src binding with a plain string throws NG0904', () => {
    expect(() => render(ResourceUrlHost, 'https://example.test/frame')).toThrowError(/NG0904: unsafe value used in a resource URL context/);
  });

  it('Section 3: a sandbox binding on an iframe is rejected', () => {
    expect(() => render(SandboxHost, 'allow-scripts')).toThrowError(/NG0910: Angular has detected that the `sandbox` was applied as a binding to the <iframe> element/);
  });

  it('Section 3: a style binding is not sanitized', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const paragraph = render(StyleHost, 'url("javascript:window.__m33Hits=1")').querySelector('p');

    expect(paragraph?.style.backgroundImage).toBe('url("javascript:window.__m33Hits=1")');
    expect(warn).not.toHaveBeenCalled();
  });

  it('Section 3: the sanitizer warns in development mode', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(UrlHost, 'javascript:alert(1)');
    render(HtmlHost, HTML);

    const see = 'https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss';
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      `WARNING: sanitizing unsafe URL value javascript:alert(1) (see ${see})`,
      `WARNING: sanitizing unsafe URL value javascript:window.__m33Hits=1 (see ${see})`, // the link inside HTML
      `WARNING: sanitizing HTML stripped some content, see ${see}`,
    ]);

    // Any dropped content warns, even a harmless style attribute.
    warn.mockClear();
    render(HtmlHost, '<p style="color:red">t</p>');
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([`WARNING: sanitizing HTML stripped some content, see ${see}`]);
  });
});
