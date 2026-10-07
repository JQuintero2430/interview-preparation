// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://app.example.com/path/page" }
import { CookieJar } from './cookie-jar';

const page = 'https://app.example.com/path/page';
const names = (header: string): string[] => header.split('; ').filter(Boolean).map((pair) => pair.split('=')[0] ?? '');

/** Cases both jars must agree on: the header, as set from the page at `page`, and whether the jar keeps it. */
const SHARED_CASES: ReadonlyArray<readonly [header: string, accepted: boolean]> = [
  ['a1=1; Domain=other.com', false],
  ['a2=1; Domain=example.com', true],
  ['a3=1; Secure', true],
  ['__Host-a4=1', false],
  ['__Host-a5=1; Secure; Path=/', true],
  ['__Host-a6=1; Secure; Path=/; Domain=example.com', false],
  ['__Host-a7=1; Secure; Path=/other', false],
  ['__Secure-a8=1', false],
  ['__Secure-a9=1; Secure', true],
];

describe('E09.3 cookie jar', () => {
  it('Set-Cookie attributes are parsed, a cookie is host-only unless Domain is given, and the default Path is the URL directory', () => {
    const jar = new CookieJar(() => 1_000);
    jar.set('id=abc; Domain=.Example.com; Path=/a; Max-Age=60; Secure; HttpOnly; SameSite=lax', 'https://app.example.com/a/b');
    jar.set('host=1', 'https://app.example.com/x/y/z');
    jar.set('root=1', 'https://app.example.com/page');
    const [id, host, root] = jar.all();
    expect(id).toEqual({ name: 'id', value: 'abc', domain: 'example.com', hostOnly: false, path: '/a', secure: true, httpOnly: true, sameSite: 'Lax', expiresAt: 61_000 });
    expect(host).toMatchObject({ domain: 'app.example.com', hostOnly: true, path: '/x/y', sameSite: undefined, expiresAt: undefined });
    expect(root?.path).toBe('/');
    expect(jar.set('bad=1; Domain=other.com', page)).toBe(false);
  });

  it("a __Host- cookie is accepted only with Secure, Path=/ and no Domain, and __Secure- needs Secure (agreeing with jsdom's jar on the shared cases)", () => {
    const jar = new CookieJar();
    for (const [header, accepted] of SHARED_CASES) {
      const name = header.split('=')[0]!;
      expect([header, jar.set(header, page)]).toEqual([header, accepted]);
      document.cookie = header;
      expect([header, names(document.cookie).includes(name)]).toEqual([header, accepted]);
    }
  });

  it('Domain, Path and Secure decide which cookies the Cookie header carries for a URL', () => {
    const jar = new CookieJar();
    jar.set('host=1; Path=/', 'https://app.example.com/');
    jar.set('shared=2; Domain=example.com; Path=/', 'https://app.example.com/');
    jar.set('deep=3; Path=/app', 'https://app.example.com/app/x');
    jar.set('tls=4; Path=/; Secure', 'https://app.example.com/');
    expect(names(jar.cookieHeader('https://app.example.com/'))).toEqual(['host', 'shared', 'tls']);
    expect(names(jar.cookieHeader('http://app.example.com/'))).toEqual(['host', 'shared']);
    expect(names(jar.cookieHeader('https://api.example.com/'))).toEqual(['shared']);
    expect(names(jar.cookieHeader('https://other.com/'))).toEqual([]);
    expect(names(jar.cookieHeader('https://app.example.com/app/x'))).toEqual(['deep', 'host', 'shared', 'tls']);
    expect(names(jar.cookieHeader('https://app.example.com/application'))).toEqual(['host', 'shared', 'tls']);
  });

  it('SameSite=Strict is never sent cross-site, Lax only on a top-level GET navigation, None requires Secure, and same-site requests send everything', () => {
    const jar = new CookieJar();
    const url = 'https://app.example.com/';
    expect(jar.set('none=1; SameSite=None', url)).toBe(false);
    for (const attributes of ['SameSite=Strict', 'SameSite=Lax', 'SameSite=None; Secure', '']) jar.set(`${attributes.split('=')[1]?.split(';')[0] ?? 'unset'}=1; ${attributes}`, url);
    const sent = (context: Parameters<CookieJar['cookieHeader']>[1]) => names(jar.cookieHeader(url, context)).sort();
    expect(sent({})).toEqual(['Lax', 'None', 'Strict', 'unset']);
    expect(sent({ crossSite: false, method: 'POST' })).toEqual(['Lax', 'None', 'Strict', 'unset']);
    expect(sent({ crossSite: true, topLevelNavigation: true, method: 'GET' })).toEqual(['Lax', 'None', 'unset']);
    expect(sent({ crossSite: true, topLevelNavigation: true, method: 'POST' })).toEqual(['None']);
    expect(sent({ crossSite: true, topLevelNavigation: false, method: 'GET' })).toEqual(['None']);
  });

  it('HttpOnly cookies are sent but absent from scriptView, and Max-Age=0 deletes a cookie', () => {
    let now = 0;
    const jar = new CookieJar(() => now);
    jar.set('sid=1; HttpOnly; Path=/', page);
    jar.set('theme=dark; Path=/', page);
    expect(names(jar.cookieHeader(page))).toEqual(['sid', 'theme']);
    expect(names(jar.scriptView(page))).toEqual(['theme']);
    jar.set('theme=; Path=/; Max-Age=0', page);
    expect(names(jar.cookieHeader(page))).toEqual(['sid']);
    jar.set('short=1; Path=/; Max-Age=1', page);
    now = 2_000;
    expect(names(jar.cookieHeader(page))).toEqual(['sid']);
  });
});
