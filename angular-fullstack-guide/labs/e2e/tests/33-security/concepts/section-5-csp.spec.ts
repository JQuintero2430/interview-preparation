// Section 5: Angular under a strict Content Security Policy, in Chromium. Both pages are answered by
// server/security/05-csp.mjs: /m33/csp (nonce build, a policy header carrying the response's nonce) and
// /autocsp/m33/csp (autoCsp build, the hash-based meta policy; the header sets only style-src).
// Query flags: `inject` (an inline script and an onerror handler that count window.__m33Hits), `mismatch` (the root
// element's ngCspNonce differs from the header's nonce), `report-only` (the policy is only reported).
import { expect, test, type Page, type Response } from '@playwright/test';
import { consoleErrors, cspViolations, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

const PAGE = `${SEC_ORIGIN}/m33/csp`;
const AUTOCSP_PAGE = `${SEC_ORIGIN}/autocsp/m33/csp`;
const STYLED = 'Styled by a component style';
const GREEN = 'rgb(0, 128, 0)'; // the component style's color

/** The nonce of a policy's `'nonce-…'` source. */
function headerNonce(response: { headers(): Record<string, string> }): string {
  const headers = response.headers();
  const policy = headers['content-security-policy'] ?? headers['content-security-policy-report-only'] ?? '';
  const match = /'nonce-([^']+)'/.exec(policy);
  if (!match) throw new Error(`no nonce in the policy "${policy}"`);
  return match[1];
}

/** Opens a variant of the CSP page and waits until the app has rendered it and the network is idle. */
async function open(page: Page, url: string): Promise<Response> {
  const response = await page.goto(url);
  if (!response) throw new Error(`no response for ${url}`);
  await expect(page.getByRole('heading', { name: 'Content Security Policy' })).toBeVisible();
  await page.waitForLoadState('networkidle'); // violation events arrive asynchronously through an exposed function
  return response;
}

/** What the injected payloads counted (`undefined` when neither ran). */
function hits(page: Page): Promise<unknown> {
  return page.evaluate(() => Reflect.get(window, '__m33Hits'));
}

/** The fields of a `report-uri` report body that the tests compare, sorted by directive. */
async function reportSummaries(page: Page, run: string): Promise<{ contentType: string; directive: unknown; disposition: unknown; blocked: unknown }[]> {
  const { reports } = await serverLog(page.request, run);
  return reports
    .map(({ contentType, report }) => {
      const body = typeof report === 'object' && report !== null ? report : {};
      return {
        contentType,
        directive: Reflect.get(body, 'violated-directive'),
        disposition: Reflect.get(body, 'disposition'),
        blocked: Reflect.get(body, 'blocked-uri'),
      };
    })
    .sort((a, b) => String(a.directive).localeCompare(String(b.directive)));
}

test('Section 5: the app boots under a nonce-based policy with no violation', async ({ context, page }) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  const response = await open(page, PAGE);
  const nonce = headerNonce(response);

  expect(response.headers()['content-security-policy']).toBe(
    `script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'self'; report-uri /__csp-report?run=${run}`,
  );
  await expect(page.getByText(STYLED)).toHaveCSS('color', GREEN);
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('Section 5: component styles carry the response nonce', async ({ context, page }) => {
  await newRun(context);

  const nonce = headerNonce(await open(page, PAGE));
  const styles = await page.locator('style').evaluateAll((elements) =>
    elements.map((element) => ({ nonce: element.nonce, attribute: element.getAttribute('nonce') })),
  );

  // Angular's <style> element holds the nonce; the browser hides the attribute's value from DOM reads.
  expect(styles).toEqual([{ nonce, attribute: '' }]);
  await expect(page.getByText(STYLED)).toHaveCSS('color', GREEN);
});

test('Section 5: a fresh nonce is sent with every response', async ({ context, page }) => {
  await newRun(context);

  const first = await page.request.get(PAGE);
  const second = await page.request.get(PAGE);
  const nonce = headerNonce(first);
  const nonceAttributes = [...(await first.text()).matchAll(/\s(\w*nonce)="([^"]*)"/g)].map((match) => [match[1], match[2]]);

  expect(headerNonce(second)).not.toBe(nonce);
  // The import map, the root element and the main script all carry the header's nonce.
  expect(nonceAttributes).toEqual([
    ['nonce', nonce],
    ['ngcspnonce', nonce],
    ['nonce', nonce],
  ]);
});

test('Section 5: an injected inline script is blocked and reported', async ({ context, page }) => {
  const run = await newRun(context);
  const violations = await cspViolations(page);

  await open(page, `${PAGE}?inject`);

  expect(await hits(page)).toBeUndefined();
  await expect.poll(() => violations.length).toBe(2);
  expect(violations).toEqual([
    { violatedDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce' },
    { violatedDirective: 'script-src-attr', blockedURI: 'inline', disposition: 'enforce' },
  ]);
  await expect
    .poll(() => reportSummaries(page, run))
    .toEqual([
      { contentType: 'application/csp-report', directive: 'script-src-attr', disposition: 'enforce', blocked: 'inline' },
      { contentType: 'application/csp-report', directive: 'script-src-elem', disposition: 'enforce', blocked: 'inline' },
    ]);
});

test('Section 5: a page nonce that does not match the header blocks the component styles', async ({ context, page }) => {
  const run = await newRun(context);
  const violations = await cspViolations(page);

  // The heading renders: the script tags carry the header's nonce. Only the root element's ngCspNonce differs.
  const nonce = headerNonce(await open(page, `${PAGE}?mismatch`));

  expect(await page.locator('lab-root').getAttribute('ngcspnonce')).not.toBe(nonce);
  await expect(page.getByText(STYLED)).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect.poll(() => violations.length).toBe(1);
  expect(violations).toEqual([{ violatedDirective: 'style-src-elem', blockedURI: 'inline', disposition: 'enforce' }]);
  await expect
    .poll(() => reportSummaries(page, run))
    .toEqual([{ contentType: 'application/csp-report', directive: 'style-src-elem', disposition: 'enforce', blocked: 'inline' }]);
});

test('Section 5: report-only mode reports the injected script without blocking it', async ({ context, page }) => {
  const run = await newRun(context);
  const violations = await cspViolations(page);

  const response = await open(page, `${PAGE}?inject&report-only`);

  expect(response.headers()['content-security-policy']).toBeUndefined();
  await expect.poll(() => hits(page)).toBe(2); // the inline script and the onerror handler both ran
  await expect.poll(() => violations.length).toBe(2);
  expect(violations).toEqual([
    { violatedDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'report' },
    { violatedDirective: 'script-src-attr', blockedURI: 'inline', disposition: 'report' },
  ]);
  await expect
    .poll(() => reportSummaries(page, run))
    .toEqual([
      { contentType: 'application/csp-report', directive: 'script-src-attr', disposition: 'report', blocked: 'inline' },
      { contentType: 'application/csp-report', directive: 'script-src-elem', disposition: 'report', blocked: 'inline' },
    ]);
});

test('Section 5: the autoCsp build boots under its hash-based meta policy', async ({ context, page }) => {
  await newRun(context);
  const violations = await cspViolations(page);

  const response = await open(page, AUTOCSP_PAGE);

  expect(response.headers()['content-security-policy']).toBe("style-src 'self' 'unsafe-inline'");
  expect(await response.text()).toContain(`<head><meta http-equiv="Content-Security-Policy" content="script-src 'strict-dynamic' 'sha256-`);
  await expect(page.getByText(STYLED)).toHaveCSS('color', GREEN);
  expect(violations).toEqual([]);

  // The meta policy is enforced: the same injection as on the nonce page is blocked.
  await open(page, `${AUTOCSP_PAGE}?inject`);
  expect(await hits(page)).toBeUndefined();
  await expect.poll(() => violations.length).toBe(2);
  expect(violations).toEqual([
    { violatedDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce' },
    { violatedDirective: 'script-src-attr', blockedURI: 'inline', disposition: 'enforce' },
  ]);
});
