import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { consoleErrors, cspViolations, newRun, SEC_ORIGIN } from './support/security.js';

/** The value of the root element's `ngCspNonce` attribute (the build writes it lowercase). */
function rootNonce(html: string): string {
  const match = /<lab-root ngcspnonce="([^"]*)">/.exec(html);
  if (!match) throw new Error('no ngcspnonce on <lab-root>');
  return match[1];
}

test('Smoke: the module 33 security lab serves a fresh nonce in every HTML response', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);

  const first = await (await page.request.get(`${SEC_ORIGIN}/`)).text();
  const second = await (await page.request.get(`${SEC_ORIGIN}/m33/`)).text();

  const nonce = rootNonce(first);
  expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/); // 16 random bytes, base64
  expect(rootNonce(second)).not.toBe(nonce);
  expect(first).not.toContain('__CSP_NONCE__');
  expect(first).toContain(`type="module" crossorigin="anonymous" integrity="sha384-`);
  expect(first).toContain(`nonce="${nonce}"></script>`);

  await page.goto(`${SEC_ORIGIN}/`);
  await expect(page.getByRole('heading', { name: 'Module 33 security lab' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Smoke: the autoCsp build serves a hash-based policy in a meta tag', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  const html = await (await page.request.get(`${SEC_ORIGIN}/autocsp/`)).text();
  const policy = /<head><meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(html)?.[1];
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const hashes = inlineScripts.map((text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`);

  expect(policy).toBe(`script-src 'strict-dynamic' ${hashes.join(' ')} https: 'unsafe-inline';object-src 'none';base-uri 'self';`);
  expect(html).toContain('<base href="/autocsp/">');

  await page.goto(`${SEC_ORIGIN}/autocsp/`);
  await expect(page.getByRole('heading', { name: 'Module 33 security lab' })).toBeVisible();
  await page.waitForLoadState('networkidle'); // violations arrive asynchronously through an exposed function
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});
