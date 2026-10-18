// Shared helpers for module 37 (HOUSE-38). Read-only to every module-37 task.
// They target the builds of the `elements-lab` project served by server/elements-server.mjs on port 4900.
// Every module-37 browser context sets `serviceWorkers` explicitly: 'block' unless the test is about the worker (then `swContext`).
// Functions handed to `evaluate` are serialised, so each one is self-contained.
import { expect, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';

/** The lab's own site. */
export const ORIGIN = 'http://localhost:4900';

/** A fresh context that lets the page register a service worker. */
export async function swContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({ serviceWorkers: 'allow' });
}

/** Polls until `navigator.serviceWorker.controller` is set for the page. */
export async function waitForController(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
}

/** The text of the worker's `/ngsw/state` debug page, fetched from the page. */
export async function swState(page: Page): Promise<string> {
  return page.evaluate(() => fetch('/ngsw/state').then((response) => response.text()));
}

/** The server's per-path request counters (`GET /api/m37/hits`). */
export async function hits(request: APIRequestContext): Promise<Record<string, number>> {
  const response = await request.get(`${ORIGIN}/api/m37/hits`);
  const counters: Record<string, number> = await response.json();
  return counters;
}

/** Chooses the build the server serves: sets the `m37-deploy` cookie to `v1` or `v2` for the context. */
export async function deploy(context: BrowserContext, version: 'v1' | 'v2'): Promise<void> {
  await context.addCookies([{ name: 'm37-deploy', value: version, url: ORIGIN }]);
}
