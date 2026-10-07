// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://app.example.com/path/page" }
// Q09.16 (Output question of module 09): what script and the server can set, and what `document.cookie` shows (jsdom 30.1.1, tough-cookie).
import { captureLogs } from '../capture';

interface CookieJarLike {
  setCookieSync(cookie: string, url: string): unknown;
  getCookieStringSync(url: string): string;
}
const jar = (globalThis as unknown as { jsdom: { cookieJar: CookieJarLike } }).jsdom.cookieJar;
const page = 'https://app.example.com/path/page';

afterEach(() => {
  jar.setCookieSync('srv=; Max-Age=0; Path=/path', page);
  document.cookie = 'a=; Max-Age=0; Path=/path';
});

describe('Module 09 · Output questions: cookies', () => {
  it('Q09.16 document.cookie shows only what script may read and the page URL can see; the jar also holds the server HttpOnly cookie', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      document.cookie = 'a=1';
      document.cookie = 'b=2; HttpOnly';
      jar.setCookieSync('srv=3; HttpOnly', page);
      document.cookie = 'c=4; Domain=other.com';
      document.cookie = '__Host-h=5; Path=/';
      document.cookie = 'p=6; Path=/other';
      console.log(document.cookie);
      console.log(jar.getCookieStringSync(page));
    });
    expect(lines).toEqual(['a=1', 'a=1; srv=3']);
  });
});
