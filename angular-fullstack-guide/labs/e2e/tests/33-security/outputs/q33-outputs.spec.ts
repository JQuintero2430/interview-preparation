// Output questions of module 33 that need a browser. Each test is named after its question ID.
import { readdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { rawHtml, SSR_ORIGIN, stateScript } from '../../32-ssr-ssg-hydration/support/ssr.js';
import { ATTACKER_ORIGIN, consoleErrors, cspViolations, distFile, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

/** The payload only counts: it adds one to `window.__m33Hits`. */
const PAYLOAD = '<img src=x onerror="window.__m33Hits=(window.__m33Hits||0)+1">';
/** How the browser serializes the payload once it is an element. */
const PAYLOAD_ELEMENT = '<img src="x" onerror="window.__m33Hits=(window.__m33Hits||0)+1">';

test('Q33.04 one payload reaches four sinks: only the direct innerHTML write keeps the handler and runs it', async ({ context, page }) => {
  await newRun(context);
  await page.goto(`${SEC_ORIGIN}/m33/xss/sinks?q=${encodeURIComponent(PAYLOAD)}`);
  const paragraph = (name: string) => page.getByRole('region', { name }).locator('p');

  // Interpolation and [textContent]: the characters, so no element and no handler.
  for (const name of ['Interpolation', 'textContent binding']) {
    await expect(paragraph(name)).toHaveText(PAYLOAD);
    await expect(paragraph(name).locator('*')).toHaveCount(0);
  }
  // [innerHTML]: an image without its handler.
  await expect(paragraph('innerHTML binding').locator('img')).toHaveCount(1);
  expect(await paragraph('innerHTML binding').innerHTML()).toBe('<img src="x">');
  // The direct write: the whole element, handler included.
  await expect(paragraph('Direct innerHTML write').locator('img')).toHaveCount(1);
  expect(await paragraph('Direct innerHTML write').innerHTML()).toBe(PAYLOAD_ELEMENT);

  // The handler ran once, from the direct write.
  await expect.poll(() => page.evaluate(() => Reflect.get(window, '__m33Hits') ?? 0)).toBe(1);
});

test('Q33.14 under a nonce-based policy the bundles and nonced styles run, injected script is blocked, and a mismatched page nonce blocks the styles', async ({ context, page }) => {
  await newRun(context);
  const heading = (target: typeof page) => target.getByRole('heading', { name: 'Content Security Policy' });
  const styled = (target: typeof page) => target.getByText('Styled by a component style');
  const hits = (target: typeof page) => target.evaluate(() => Reflect.get(window, '__m33Hits'));

  // The page's nonce matches the header, and an inline script and an onerror handler are injected.
  const violations = await cspViolations(page);
  await page.goto(`${SEC_ORIGIN}/m33/csp?inject`);
  await expect(heading(page)).toBeVisible(); // the bundles ran
  await expect(styled(page)).toHaveCSS('color', 'rgb(0, 128, 0)'); // the component style applied
  await expect.poll(() => violations.length).toBe(2);
  expect(violations.map(({ violatedDirective }) => violatedDirective).sort()).toEqual(['script-src-attr', 'script-src-elem']);
  expect(await hits(page)).toBeUndefined(); // neither injected payload ran

  // The page's nonce differs from the header's.
  const other = await context.newPage();
  const mismatched = await cspViolations(other);
  await other.goto(`${SEC_ORIGIN}/m33/csp?mismatch`);
  await expect(heading(other)).toBeVisible(); // the bundles still ran
  await expect(styled(other)).toHaveCSS('color', 'rgb(0, 0, 0)'); // the component style was refused
  await expect.poll(() => mismatched.length).toBe(1);
  expect(mismatched.map(({ violatedDirective }) => violatedDirective)).toEqual(['style-src-elem']);
});

test('Q33.17 under require-trusted-types-for with only the angular policy, bindings and a lazy route work, a bypassed value and a direct write fail', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);
  const region = (label: string) => page.getByRole('region', { name: label }).locator('div').first();

  // The [innerHTML] binding, a direct write and a lazy route: all on /m33/tt, header `trusted-types angular`.
  await page.goto(`${SEC_ORIGIN}/m33/tt`);
  await expect(page.getByRole('heading', { name: 'Trusted Types' })).toBeVisible();
  expect(await region('Sanitized binding').innerHTML()).toBe('<b>Sanitized</b>');
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);

  await page.getByRole('button', { name: 'Run the legacy widget' }).click();
  await expect(page.getByRole('status')).toHaveText(
    "TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.",
  );
  expect(await region('Legacy widget').innerHTML()).toBe('');

  await page.getByRole('link', { name: 'Open the lazy page' }).click();
  await expect(page.getByRole('heading', { name: 'Lazy page' })).toBeVisible();
  // Only the direct write was refused so far; the lazy chunk added nothing.
  expect(violations.map(({ blockedURI }) => blockedURI)).toEqual(['trusted-types-sink']);

  // The bypassed value, on its own page: Angular cannot get the policy it needs, so the box stays empty.
  const bypass = await context.newPage();
  const bypassViolations = await cspViolations(bypass);
  await bypass.goto(`${SEC_ORIGIN}/m33/tt/bypass`);
  await expect(bypass.getByRole('heading', { name: 'Bypassed HTML' })).toBeVisible();
  expect(await bypass.getByRole('region', { name: 'Bypassed binding' }).locator('div').first().innerHTML()).toBe('');
  await expect.poll(() => bypassViolations.length).toBe(2);
  expect(bypassViolations.map(({ violatedDirective }) => violatedDirective)).toEqual(['trusted-types', 'require-trusted-types-for']);
});

test('Q33.19 a server-rendered page escapes a closing script tag in the body and in the state script, and nothing runs after hydration', async ({ page, request }) => {
  const value = '</script><script>window.__m33Hits=1</script>';
  const { body } = await rawHtml(request, `/m33/ssr/state?q=${encodeURIComponent(value)}`);

  // The body shows the value as text.
  expect(body).toContain('<output aria-label="Display name">&lt;/script&gt;&lt;script&gt;window.__m33Hits=1&lt;/script&gt;</output>');
  // The state script holds it with `<` and `/` escaped, so the first closing tag after it is its own.
  expect(body).toContain('"lab-display-name":"\\u003C\\u002Fscript>\\u003Cscript>window.__m33Hits=1\\u003C\\u002Fscript>"');
  expect(body).not.toContain('</script><script>window.__m33Hits');
  expect(stateScript(body)).toMatchObject({ 'lab-display-name': value });

  // After hydration the value is still text and nothing ran.
  await page.goto(`${SSR_ORIGIN}/m33/ssr/state?q=${encodeURIComponent(value)}`);
  await expect(page.getByLabel('Display name')).toHaveText(value);
  expect(await page.evaluate(() => Reflect.get(window, '__m33Hits'))).toBeUndefined();
});

test('Q33.22 injected script reads the localStorage token and captures the memory one, cannot read the HttpOnly cookie, and can still call the API with it', async ({ context, page, request }) => {
  await newRun(context);
  const me = `${SEC_ORIGIN}/api/m33/tokens/me`;
  const signIn = async (store: 'local' | 'memory' | 'cookie') => {
    await page.goto(`${SEC_ORIGIN}/m33/tokens/${store}`);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('status')).toHaveText('Signed in');
  };

  // localStorage: the string is readable, and works from another client.
  await signIn('local');
  const stored = await page.evaluate(() => localStorage.getItem('m33-access-token'));
  expect(stored).toMatch(/\S/);
  expect((await request.get(me, { headers: { Authorization: `Bearer ${stored}` } })).status()).toBe(200);

  // Memory: no store holds it, but the payload wraps fetch and sees the app's next request.
  await signIn('memory');
  expect(await page.evaluate(() => Reflect.get(window, '__m33Captured'))).toBeUndefined();
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
  const captured = String(await page.evaluate(() => Reflect.get(window, '__m33Captured')));
  expect(captured).toMatch(/^Bearer \S+$/);
  expect((await request.get(me, { headers: { Authorization: captured } })).status()).toBe(200);

  // HttpOnly cookie: not in document.cookie, but a same-origin fetch from the page carries it.
  await signIn('cookie');
  const visible = await page.evaluate(() => document.cookie);
  expect(visible).not.toContain('m33-session');
  const answer = await page.evaluate(async () => {
    const response = await fetch('/api/m33/tokens/me');
    return { status: response.status, body: await response.text() };
  });
  expect(answer).toEqual({ status: 200, body: '{"name":"Ada"}' });
  expect((await request.get(me)).status()).toBe(401); // another client has no cookie
});

test('Q33.25 a cross-site form post sends the None cookie and the one without SameSite, a no-cors fetch only None, and the server rejects both for the missing header', async ({ context, page }) => {
  const run = await newRun(context);
  await page.goto(`${SEC_ORIGIN}/m33/csrf/bank`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in');

  /** Waits until the server has logged `count` transfers for the run, then returns them. */
  const transfers = async (count: number) => {
    let seen: unknown[] = [];
    await expect
      .poll(async () => {
        const { requests } = await serverLog(context.request, run);
        seen = requests.filter((entry) => typeof entry === 'object' && entry !== null && 'transfer' in entry);
        return seen.length;
      })
      .toBe(count);
    return seen;
  };

  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/form`);
  await transfers(1);
  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/fetch`);
  const forged = await transfers(2);
  const expected = { transfer: true, secFetchSite: 'cross-site', origin: ATTACKER_ORIGIN, header: false, status: 403 };
  expect(forged).toEqual([
    { ...expected, cookies: ['def', 'none'] },
    { ...expected, cookies: ['none'] },
  ]);
});

test('Q33.26 a canMatch guard keeps a non-admin on the fallback page, yet the admin chunk is a public file and the API answers that session 403 and an admin 200', async ({ context, page, request }) => {
  await newRun(context);
  const marker = 'LAB_M33_ADMIN_CHUNK';
  const names = (await readdir(new URL('../../../../angular/dist/security-lab/browser/', import.meta.url))).filter((name) => name.endsWith('.js'));
  const holders: string[] = [];
  for (const name of names) {
    if ((await distFile('security-lab', `browser/${name}`)).toString('utf8').includes(marker)) holders.push(name);
  }
  expect(holders).toHaveLength(1);
  const chunk = holders[0] ?? '';
  const requested: string[] = [];
  page.on('request', (seen) => requested.push(seen.url()));

  // The guard: the non-admin lands on the fallback page and the router never asks for the chunk.
  await page.goto(`${SEC_ORIGIN}/m33/guards`);
  await page.getByRole('button', { name: 'Sign in as user' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in as user');
  await page.getByRole('link', { name: 'Open admin' }).click();
  await expect(page.getByRole('heading', { name: 'Not available for your role' })).toBeVisible();
  expect(requested.some((url) => url.endsWith(`/${chunk}`))).toBe(false);

  // The file: a request with no session cookie gets the whole chunk.
  const file = await request.get(`${SEC_ORIGIN}/${chunk}`);
  expect(file.status()).toBe(200);
  expect(await file.text()).toContain(marker);

  // The API: the user's session gets 403, an admin's session 200.
  const report = `${SEC_ORIGIN}/api/m33/guards/report`;
  expect((await context.request.get(report)).status()).toBe(403);
  await context.request.post(`${SEC_ORIGIN}/api/m33/guards/login?role=admin`);
  expect((await context.request.get(report)).status()).toBe(200);
});
