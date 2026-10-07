// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://app.example.com/path/page" }
// Section 6 (jsdom 30.1.1, whose cookie jar is tough-cookie): what script can set and see, and what the jar stores and sends.
// SameSite, Partitioned and third-party blocking need a browser's cross-site context and are documented in the module, not run here.

interface CookieJarLike {
  setCookieSync(cookie: string, url: string): unknown;
  getCookieStringSync(url: string): string;
}
// Vitest's jsdom environment exposes the JSDOM instance as a global; its `cookieJar` is the server-side view of the jar.
const jar = (globalThis as unknown as { jsdom: { cookieJar: CookieJarLike } }).jsdom.cookieJar;
const page = 'https://app.example.com/path/page';

const names = (cookieString: string): string[] => cookieString.split('; ').filter(Boolean).map((pair) => pair.split('=')[0] ?? '');

afterEach(() => {
  jar.setCookieSync('srv=; Max-Age=0; Path=/path', page); // script cannot delete an HttpOnly cookie, the server side can
  for (const name of names(jar.getCookieStringSync(page)).concat(['e', 'k'])) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    document.cookie = `${name}=; Max-Age=0; Path=/path`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=example.com`;
  }
});

describe('Module 09 · section 6', () => {
  it('Section 6: script cannot set HttpOnly, and a server-set HttpOnly cookie is in the jar but not in document.cookie', () => {
    document.cookie = 'b=2; HttpOnly';
    jar.setCookieSync('srv=1; HttpOnly', page);
    expect(names(document.cookie)).not.toContain('b');
    expect(names(document.cookie)).not.toContain('srv');
    expect(names(jar.getCookieStringSync(page))).toContain('srv');
  });

  it('Section 6: a Domain of another site is rejected, a parent domain is accepted and then reaches sibling hosts', () => {
    document.cookie = 'c=3; Domain=other.com';
    document.cookie = 'k=1; Domain=example.com; Path=/';
    expect(names(document.cookie)).not.toContain('c');
    expect(names(document.cookie)).toContain('k');
    expect(names(jar.getCookieStringSync('https://other.example.com/'))).toEqual(['k']);
  });

  it('Section 6: without Domain a cookie is host-only', () => {
    document.cookie = 'd=4';
    expect(names(jar.getCookieStringSync('https://other.example.com/'))).not.toContain('d');
    expect(names(jar.getCookieStringSync(page))).toContain('d');
  });

  it('Section 6: a cookie without Path gets the default path (the URL directory), so Path=/other is invisible here', () => {
    document.cookie = 'd=4';
    document.cookie = 'e=5; Path=/other';
    expect(names(jar.getCookieStringSync('https://app.example.com/path/page'))).toEqual(['d']);
    expect(names(jar.getCookieStringSync('https://app.example.com/path/deeper/page'))).toEqual(['d']);
    expect(names(jar.getCookieStringSync('https://app.example.com/other'))).toEqual(['e']);
    expect(names(jar.getCookieStringSync('https://app.example.com/'))).toEqual([]);
  });

  it('Section 6: Secure is stored on https, never sent over http', () => {
    document.cookie = 'a=1; Secure; Path=/';
    expect(names(jar.getCookieStringSync('https://app.example.com/path/page'))).toEqual(['a']);
    expect(names(jar.getCookieStringSync('http://app.example.com/path/page'))).toEqual([]);
  });

  it('Section 6: __Host- needs Secure and Path=/ and no Domain, __Secure- needs Secure', () => {
    document.cookie = '__Host-h=8; Path=/';
    document.cookie = '__Host-g=7; Secure; Path=/';
    document.cookie = '__Host-d=6; Secure; Path=/; Domain=example.com';
    document.cookie = '__Secure-s=5';
    document.cookie = '__Secure-t=5; Secure';
    expect(names(document.cookie).sort()).toEqual(['__Host-g', '__Secure-t']);
  });

  it('Section 6: Max-Age=0 deletes a cookie', () => {
    document.cookie = 'a=1; Path=/';
    expect(names(document.cookie)).toContain('a');
    document.cookie = 'a=1; Path=/; Max-Age=0';
    expect(names(document.cookie)).not.toContain('a');
  });
});
