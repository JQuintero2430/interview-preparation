// Exercise 33.2: lock a comments page down with a strict CSP and Trusted Types, in Chromium. Every page is answered by
// server/security/ex2-locked-page.mjs with `require-trusted-types-for 'script'`. The statement's two "before" pages:
// /m33/ex2/start (nonce build, the legacy widget) and /autocsp/m33/ex2/a (autoCsp build). The criteria run over
// /m33/ex2/a (solution: an [innerHTML] binding, `trusted-types angular`) and /m33/ex2/b (alternative: the widget's own
// sanitizing policy, also allowed by name), both with a nonce-based policy.
// Query flag `inject`: an inline script and an onerror handler before the app root (both count window.__m33Hits).
import { expect, test, type Page, type Response } from '@playwright/test';
import {
  consoleErrors,
  cspViolations,
  newRun,
  SEC_ORIGIN,
  serverLog,
} from '../support/security.js';

const GREEN = 'rgb(0, 128, 0)'; // the page's component style
const COMMENT = '<p><b>Great</b> post</p>';
const SINK_VIOLATION = {
  violatedDirective: 'require-trusted-types-for',
  blockedURI: 'trusted-types-sink',
  disposition: 'enforce',
};

const variants = [
  { name: 'solution: an [innerHTML] binding', path: '/m33/ex2/a', policyNames: 'angular' },
  {
    name: 'alternative: a sanitizing policy of its own',
    path: '/m33/ex2/b',
    policyNames: 'angular lab-m33-widget',
  },
];

/** Opens a page, waits for its heading and for the network to go idle (violation events arrive asynchronously). */
async function open(page: Page, url: string): Promise<Response> {
  const response = await page.goto(url);
  if (!response) throw new Error(`no response for ${url}`);
  await expect(page.getByRole('heading', { name: 'Locked page' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  return response;
}

/** The inner HTML of the widget's box in the Comments region. */
function commentHtml(page: Page): Promise<string> {
  return page.getByRole('region', { name: 'Comments' }).locator('div').first().innerHTML();
}

/** The `violated-directive` of each report the server received for the run, sorted (their order varies). */
async function reportedDirectives(page: Page, run: string): Promise<unknown[]> {
  const { reports } = await serverLog(page.request, run);
  return reports
    .map(({ report }) =>
      typeof report === 'object' && report !== null
        ? Reflect.get(report, 'violated-directive')
        : undefined,
    )
    .sort();
}

/** What the injected payloads counted (`undefined` when none ran). */
function hits(page: Page): Promise<unknown> {
  return page.evaluate(() => Reflect.get(window, '__m33Hits'));
}

test("Before the fix: the legacy widget's innerHTML write throws under Trusted Types", async ({
  context,
  page,
}) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const violations = await cspViolations(page);

  await open(page, `${SEC_ORIGIN}/m33/ex2/start`);

  await expect.poll(() => violations).toEqual([SINK_VIOLATION]);
  expect(await commentHtml(page)).toBe('');
  expect(errors.map((error) => error.split('\n')[0])).toEqual([
    "This document requires 'TrustedHTML' assignment. The action has been blocked.",
    "ERROR TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.",
  ]);
});

test('Before the fix: the autoCsp build does not start under enforced Trusted Types', async ({
  context,
  page,
}) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const thrown: string[] = [];
  page.on('pageerror', (error) => thrown.push(`${error.name}: ${error.message}`));
  const violations = await cspViolations(page);

  await page.goto(`${SEC_ORIGIN}/autocsp/m33/ex2/a`);
  await page.waitForLoadState('networkidle');

  // The build's loader script assigns a plain string to `script.src`, a TrustedScriptURL sink: main never loads.
  await expect(page.getByRole('heading', { name: 'Locked page' })).toHaveCount(0);
  expect(violations).toEqual([SINK_VIOLATION]);
  expect(errors).toEqual([
    "This document requires 'TrustedScriptURL' assignment. The action has been blocked.",
  ]);
  expect(thrown).toEqual([
    "TypeError: Failed to set the 'src' property on 'HTMLScriptElement': This document requires 'TrustedScriptURL' assignment.",
  ]);
});

for (const variant of variants) {
  test.describe(variant.name, () => {
    const url = `${SEC_ORIGIN}${variant.path}`;

    test('boots with no CSP or Trusted Types violation', async ({ context, page }) => {
      const run = await newRun(context);
      const errors = consoleErrors(page);
      const violations = await cspViolations(page);

      const response = await open(page, url);
      const nonce = /'nonce-([^']+)'/.exec(
        response.headers()['content-security-policy'] ?? '',
      )?.[1];

      expect(response.headers()['content-security-policy']).toBe(
        `script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'self'; ` +
          `require-trusted-types-for 'script'; trusted-types ${variant.policyNames}; report-uri /__csp-report?run=${run}`,
      );
      await expect(page.getByRole('region', { name: 'Comments' })).toHaveText('Great post');
      expect(violations).toEqual([]);
      expect(errors).toEqual([]);
    });

    test('applies the component styles under the policy', async ({ context, page }) => {
      await newRun(context);

      await open(page, url);

      await expect(page.getByRole('heading', { name: 'Locked page' })).toHaveCSS('color', GREEN);
    });

    test('blocks and reports an injected inline script', async ({ context, page }) => {
      const run = await newRun(context);
      const violations = await cspViolations(page);

      await open(page, `${url}?inject`);

      expect(await hits(page)).toBeUndefined();
      await expect.poll(() => violations.length).toBe(2);
      expect(violations).toEqual([
        { violatedDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce' },
        { violatedDirective: 'script-src-attr', blockedURI: 'inline', disposition: 'enforce' },
      ]);
      await expect
        .poll(() => reportedDirectives(page, run))
        .toEqual(['script-src-attr', 'script-src-elem']);
    });

    test("renders the comment's formatting and drops its script", async ({ context, page }) => {
      await newRun(context);

      await open(page, url);
      await expect(page.getByRole('region', { name: 'Comments' })).toHaveText('Great post');

      expect(await commentHtml(page)).toBe(`${COMMENT}<img src="data:," alt="">`);
      expect(await hits(page)).toBeUndefined();
    });

    test('rejects a raw innerHTML write from a widget', async ({ context, page }) => {
      await newRun(context);
      const violations = await cspViolations(page);

      await open(page, url);
      const thrown = await page.getByRole('region', { name: 'Comments' }).evaluate((region) => {
        try {
          region.innerHTML = '<em>Widget output</em>';
          return 'written';
        } catch (error) {
          return String(error);
        }
      });

      expect(thrown).toBe(
        "TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.",
      );
      await expect.poll(() => violations).toEqual([SINK_VIOLATION]);
    });
  });
}
