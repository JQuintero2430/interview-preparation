// Section 6: Angular under Trusted Types, in Chromium. Every page is answered by server/security/06-trusted-types.mjs
// with `require-trusted-types-for 'script'; trusted-types angular` (plus a report-uri). Query flags:
// `allow-bypass` (the header also allows `angular#unsafe-bypass`), `report-only` (the policy is only reported).
import { expect, test, type Page, type Response } from '@playwright/test';
import {
  consoleErrors,
  cspViolations,
  newRun,
  SEC_ORIGIN,
  serverLog,
} from '../support/security.js';

const PAGE = `${SEC_ORIGIN}/m33/tt`;
const BYPASS_PAGE = `${SEC_ORIGIN}/m33/tt/bypass`;

/** Opens a Trusted Types page, waits for its heading and for the network to go idle. */
async function open(page: Page, url: string, heading: string): Promise<Response> {
  const response = await page.goto(url);
  if (!response) throw new Error(`no response for ${url}`);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await page.waitForLoadState('networkidle'); // violation events arrive asynchronously through an exposed function
  return response;
}

/** The inner HTML of the `<div>` inside a labelled region. */
function regionHtml(page: Page, label: string): Promise<string> {
  return page.getByRole('region', { name: label }).locator('div').first().innerHTML();
}

test('Section 6: an [innerHTML] binding works with only the angular policy', async ({
  context,
  page,
}) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  const response = await open(page, PAGE, 'Trusted Types');

  expect(response.headers()['content-security-policy']).toBe(
    `require-trusted-types-for 'script'; trusted-types angular; report-uri /__csp-report?run=${run}`,
  );
  // Sanitized first (the script is gone), then handed to the sink as TrustedHTML from the `angular` policy.
  expect(await regionHtml(page, 'Sanitized binding')).toBe('<b>Sanitized</b>');
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('Section 6: a bypassed value is not rendered without the unsafe-bypass policy', async ({
  context,
  page,
}) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  await open(page, BYPASS_PAGE, 'Bypassed HTML');

  expect(await regionHtml(page, 'Bypassed binding')).toBe('');
  await expect.poll(() => violations.length).toBe(2);
  // First the header refuses the policy name; then the bypassed value reaches the sink as a plain string.
  expect(violations).toEqual([
    {
      violatedDirective: 'trusted-types',
      blockedURI: 'trusted-types-policy',
      disposition: 'enforce',
    },
    {
      violatedDirective: 'require-trusted-types-for',
      blockedURI: 'trusted-types-sink',
      disposition: 'enforce',
    },
  ]);
  // Chromium's two messages, then Angular's ErrorHandler logging the TypeError the sink threw (first lines only).
  expect(errors.map((error) => error.split('\n')[0])).toEqual([
    `Creating a TrustedTypePolicy named 'angular#unsafe-bypass' violates the following Content Security policy directive: "trusted-types angular". The action has been blocked.`,
    "This document requires 'TrustedHTML' assignment. The action has been blocked.",
    "ERROR TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.",
  ]);
});

test('Section 6: a bypassed value renders when the header allows angular#unsafe-bypass', async ({
  context,
  page,
}) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  const response = await open(page, `${BYPASS_PAGE}?allow-bypass`, 'Bypassed HTML');

  expect(response.headers()['content-security-policy']).toContain(
    'trusted-types angular angular#unsafe-bypass;',
  );
  expect(await regionHtml(page, 'Bypassed binding')).toBe('<b>Bypassed</b>');
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('Section 6: a direct innerHTML write throws a TypeError', async ({ context, page }) => {
  await newRun(context);
  const violations = await cspViolations(page);

  await open(page, PAGE, 'Trusted Types');
  await page.getByRole('button', { name: 'Run the legacy widget' }).click();

  await expect(page.getByRole('status')).toHaveText(
    "TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.",
  );
  expect(await regionHtml(page, 'Legacy widget')).toBe('');
  await expect.poll(() => violations.length).toBe(1);
  expect(violations).toEqual([
    {
      violatedDirective: 'require-trusted-types-for',
      blockedURI: 'trusted-types-sink',
      disposition: 'enforce',
    },
  ]);
});

test('Section 6: a lazy route loads without an angular#bundler policy', async ({
  context,
  page,
}) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  const response = await open(page, PAGE, 'Trusted Types');
  const scripts: string[] = [];
  page.on('response', (scriptResponse) => {
    if (scriptResponse.url().endsWith('.js')) scripts.push(new URL(scriptResponse.url()).pathname);
  });
  await page.getByRole('link', { name: 'Open the lazy page' }).click();

  await expect(page.getByRole('heading', { name: 'Lazy page' })).toBeVisible();
  expect(response.headers()['content-security-policy']).not.toContain('angular#bundler');
  expect(scripts).toHaveLength(1); // the lazy page's chunk, fetched after boot under the same policy
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('Section 6: report-only mode reports the direct write without throwing', async ({
  context,
  page,
}) => {
  const run = await newRun(context);
  const violations = await cspViolations(page);

  const response = await open(page, `${PAGE}?report-only`, 'Trusted Types');
  await page.getByRole('button', { name: 'Run the legacy widget' }).click();

  expect(response.headers()['content-security-policy']).toBeUndefined();
  await expect(page.getByRole('status')).toHaveText('written');
  await expect.poll(() => violations.length).toBe(1);
  expect(violations).toEqual([
    {
      violatedDirective: 'require-trusted-types-for',
      blockedURI: 'trusted-types-sink',
      disposition: 'report',
    },
  ]);
  await expect.poll(async () => (await serverLog(page.request, run)).reports.length).toBe(1);
  const [{ contentType, report }] = (await serverLog(page.request, run)).reports;
  const body = typeof report === 'object' && report !== null ? report : {};
  expect([
    contentType,
    ...['violated-directive', 'disposition', 'blocked-uri', 'script-sample'].map((field) =>
      Reflect.get(body, field),
    ),
  ]).toEqual([
    'application/csp-report',
    'require-trusted-types-for',
    'report',
    'trusted-types-sink',
    'Element innerHTML|<em>Widget output</em>',
  ]);
});
