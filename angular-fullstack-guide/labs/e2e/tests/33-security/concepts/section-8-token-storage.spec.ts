// Section 8: where the token lives. One page (security-lab, nonce build) keeps its credential in localStorage
// (`/m33/tokens/local`), in a signal (`/memory`) or in an HttpOnly cookie (`/cookie`); server/security/08-tokens.mjs
// issues it and answers `GET /api/m33/tokens/me`. "Injected script" is `page.evaluate`: it runs in the page, with the
// page's origin, as an XSS payload would. "The attacker's machine" is the `request` fixture: no cookies, another client.
import { expect, test, type Page } from '@playwright/test';
import { consoleErrors, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

const ME = `${SEC_ORIGIN}/api/m33/tokens/me`;

/** Opens a token page and signs in through its button. */
async function signIn(page: Page, store: 'local' | 'memory' | 'cookie'): Promise<void> {
  await page.goto(`${SEC_ORIGIN}/m33/tokens/${store}`);
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in');
}

test('Section 8: injected script reads a token kept in localStorage', async ({ context, page, request }) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);
  await signIn(page, 'local');

  const stolen = await page.evaluate(() => localStorage.getItem('m33-access-token'));
  const { requests } = await serverLog(context.request, run);
  expect(requests).toEqual([{ issued: 'bearer', token: stolen }]);

  // Taken elsewhere, the string works without the page, the browser or its cookies.
  const replay = await request.get(ME, { headers: { Authorization: `Bearer ${stolen}` } });
  expect(replay.status()).toBe(200);
  expect(await replay.json()).toEqual({ name: 'Ada' });
  expect(errors).toEqual([]);
});

test('Section 8: injected script cannot read an HttpOnly session cookie', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  await signIn(page, 'cookie');

  const session = (await context.cookies(SEC_ORIGIN)).find((cookie) => cookie.name === 'm33-session');
  expect(session).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  const visible = await page.evaluate(() => document.cookie);
  expect(visible).toContain('m33-run='); // a cookie without HttpOnly is visible
  expect(visible).not.toContain('m33-session');
  expect(errors).toEqual([]);
});

test('Section 8: injected script can call the API with the HttpOnly session cookie', async ({ context, page }) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);
  await signIn(page, 'cookie');

  const answer = await page.evaluate(async () => {
    const response = await fetch('/api/m33/tokens/me');
    return { status: response.status, body: await response.text() };
  });
  expect(answer).toEqual({ status: 200, body: '{"name":"Ada"}' });
  const { requests } = await serverLog(context.request, run);
  expect(requests).toEqual([{ issued: 'cookie' }, { me: 'cookie', status: 200 }]);
  expect(errors).toEqual([]);
});

test('Section 8: a token kept in memory is gone after a reload', async ({ context, page }) => {
  const run = await newRun(context);
  await signIn(page, 'memory');
  await page.getByRole('button', { name: 'Load profile' }).click();
  await expect(page.getByRole('status')).toHaveText('Profile: Ada');

  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Signed out');
  await page.getByRole('button', { name: 'Load profile' }).click();
  await expect(page.getByRole('status')).toHaveText('Profile failed: 401');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);

  const { requests } = await serverLog(context.request, run);
  expect(requests.slice(1)).toEqual([
    { me: 'bearer', status: 200 },
    { me: 'none', status: 401 },
  ]);
});

test('Section 8: injected script captures an in-memory token from the app\'s next request', async ({ context, page, request }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  await signIn(page, 'memory');

  // The payload, after boot: wrap the global fetch and keep any Authorization header that passes through it.
  await page.evaluate(() => {
    const original = window.fetch;
    window.fetch = (input, init) => {
      const authorization = new Headers(init?.headers).get('authorization');
      if (authorization) Reflect.set(window, '__m33Captured', authorization);
      return original(input, init);
    };
  });
  await page.getByRole('button', { name: 'Load profile' }).click();
  await expect(page.getByRole('status')).toHaveText('Profile: Ada');

  const captured: unknown = await page.evaluate(() => Reflect.get(window, '__m33Captured'));
  expect(captured).toMatch(/^Bearer \S+$/);
  const replay = await request.get(ME, { headers: { Authorization: String(captured) } });
  expect(replay.status()).toBe(200);
  expect(errors).toEqual([]);
});
