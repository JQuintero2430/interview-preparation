// Exercise 33.4: move the token out of Web Storage, in Chromium. server/security/ex4-tokens-a.mjs (solution: an
// access token in memory and an HttpOnly refresh cookie) answers under /api/m33/ex4/a/ and ex4-tokens-b.mjs
// (alternative: a backend-for-frontend session that calls a's bearer API for the page) under /b/. The app's page is
// /m33/ex4/<variant>; "another site" is the same server reached as 127.0.0.1 (/m33/ex4/<variant>/attacker).
// "Injected script" is `page.evaluate`; "the attacker's machine" is the `request` fixture (no cookies). Both variants
// run the same five criteria.
import { expect, test, type Page } from '@playwright/test';
import { ATTACKER_ORIGIN, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

/** What a route of either variant logged (ex4-tokens-a.mjs, `logRequest`). */
interface Ex4Entry {
  ex4: 'a' | 'b';
  route: string;
  method: string;
  cookies: string[];
  bearer: boolean;
  secFetchSite: string | null;
  status: number;
}

interface Variant {
  name: string;
  id: 'a' | 'b';
  /** The HttpOnly cookie the browser holds, and its `Path`. */
  cookie: { name: string; path: string };
  /** The route that restores the session (and, with DELETE, ends it), its method and its success status. */
  restore: { route: string; method: 'POST' | 'GET'; ok: number };
  /** The browser's credential on the data request: a bearer header in a, the session cookie in b. */
  sends: 'authorization' | 'cookie';
}

const variants: Variant[] = [
  {
    name: 'solution: an in-memory access token and an HttpOnly refresh cookie',
    id: 'a',
    cookie: { name: 'm33-ex4a-refresh', path: '/api/m33/ex4/a/refresh' },
    restore: { route: 'refresh', method: 'POST', ok: 200 },
    sends: 'authorization',
  },
  {
    name: 'alternative: a backend-for-frontend session',
    id: 'b',
    cookie: { name: 'm33-ex4b', path: '/' },
    restore: { route: 'session', method: 'GET', ok: 204 },
    sends: 'cookie',
  },
];

const DATA_TEXT = 'Ada has 3 invoices';

/** Opens the variant's page, waits for the start-up check to find no session, and signs in. */
async function signIn(page: Page, id: string): Promise<void> {
  await page.goto(`${SEC_ORIGIN}/m33/ex4/${id}`);
  await expect(page.getByRole('status')).toHaveText('Signed out');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in');
}

/** Clicks "Load data", waits for the result, and returns the headers the browser sent with the data request. */
async function loadData(page: Page, id: string): Promise<Record<string, string>> {
  const sent = page.waitForRequest((request) => request.url() === `${SEC_ORIGIN}/api/m33/ex4/${id}/data`);
  await page.getByRole('button', { name: 'Load data' }).click();
  await expect(page.getByRole('status')).toHaveText(DATA_TEXT);
  return (await sent).allHeaders();
}

/** The run's log entries for one variant and route. */
async function entries(page: Page, run: string, ex4: 'a' | 'b', route: string): Promise<Ex4Entry[]> {
  const { requests } = await serverLog(page.context().request, run);
  return requests.filter(
    (entry): entry is Ex4Entry => typeof entry === 'object' && entry !== null && 'ex4' in entry && entry.ex4 === ex4 && 'route' in entry && entry.route === route,
  );
}

for (const variant of variants) {
  test.describe(variant.name, () => {
    const api = `${SEC_ORIGIN}/api/m33/ex4/${variant.id}`;

    test('Still true: script running in the page loads the data', async ({ context, page }) => {
      await newRun(context);
      await signIn(page, variant.id);

      // The payload, after boot: wrap the global fetch and keep any Authorization header that passes through it.
      await page.evaluate(() => {
        const original = window.fetch;
        window.fetch = (input, init) => {
          const authorization = new Headers(init?.headers).get('authorization');
          if (authorization) Reflect.set(window, '__m33Captured', authorization);
          return original(input, init);
        };
      });
      await loadData(page, variant.id);

      const answer = await page.evaluate(async (url) => {
        const captured: unknown = Reflect.get(window, '__m33Captured');
        const response = await fetch(url, { headers: typeof captured === 'string' ? { authorization: captured } : {} });
        return { status: response.status, body: await response.text() };
      }, `/api/m33/ex4/${variant.id}/data`);
      expect(answer).toEqual({ status: 200, body: '{"owner":"Ada","invoices":3}' });
    });

    test('keeps no token in localStorage, sessionStorage or document.cookie', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);
      await loadData(page, variant.id);

      const visible = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
      expect(visible).toEqual({ local: 0, session: 0, cookie: `m33-run=${run}` });
      const held = (await context.cookies(`${SEC_ORIGIN}${variant.cookie.path}`)).find(({ name }) => name === variant.cookie.name);
      expect(held).toMatchObject({ httpOnly: true, sameSite: 'Strict', path: variant.cookie.path });
    });

    test("loads the user's data after login", async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      const headers = await loadData(page, variant.id);

      expect(headers['authorization'] !== undefined).toBe(variant.sends === 'authorization');
      expect(headers['cookie']?.includes(variant.cookie.name) ?? false).toBe(variant.sends === 'cookie');
      // The bearer API always receives the token: from the page in a, from the BFF in b (no cookie, no browser).
      expect(await entries(page, run, 'a', 'data')).toEqual([
        expect.objectContaining({ bearer: true, cookies: [], status: 200, secFetchSite: variant.id === 'a' ? 'same-origin' : null }),
      ]);
      if (variant.id === 'b') {
        expect(await entries(page, run, 'b', 'data')).toEqual([
          expect.objectContaining({ bearer: false, cookies: ['m33-ex4b'], status: 200 }),
        ]);
      }
    });

    test('restores the session after a reload', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      await page.reload();

      await expect(page.getByRole('status')).toHaveText('Signed in');
      await loadData(page, variant.id);
      const restores = await entries(page, run, variant.id, variant.restore.route);
      expect(restores.map(({ method, status }) => [method, status])).toEqual([
        [variant.restore.method, 401],
        [variant.restore.method, variant.restore.ok],
      ]);
    });

    test('refuses the data request from another site', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      await page.goto(`${ATTACKER_ORIGIN}/m33/ex4/${variant.id}/attacker`);

      let forged: Ex4Entry[] = [];
      await expect
        .poll(async () => {
          const routes = await Promise.all([variant.restore.route, 'data'].map((route) => entries(page, run, variant.id, route)));
          forged = routes.flat().filter(({ secFetchSite }) => secFetchSite === 'cross-site');
          return forged.length;
        })
        .toBe(2);
      for (const entry of forged) {
        expect(entry).toMatchObject({ bearer: false, status: 401 });
        expect(entry.cookies).not.toContain(variant.cookie.name);
      }
    });

    test('ends the session on logout', async ({ context, page, request }) => {
      await newRun(context);
      await signIn(page, variant.id);
      const headers = await loadData(page, variant.id);
      const stolen = { [variant.sends]: headers[variant.sends] ?? '' };
      const replay = () => request.get(`${api}/data`, { headers: stolen });
      expect((await replay()).status()).toBe(200);

      await page.getByRole('button', { name: 'Sign out' }).click();

      await expect(page.getByRole('status')).toHaveText('Signed out');
      expect((await context.cookies(`${SEC_ORIGIN}${variant.cookie.path}`)).map(({ name }) => name)).not.toContain(variant.cookie.name);
      expect((await replay()).status()).toBe(401);
      await page.reload();
      await expect(page.getByRole('status')).toHaveText('Signed out');
    });
  });
}
