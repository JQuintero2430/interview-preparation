// Shared helpers for module 32 (HOUSE-26). Read-only to every module-32 task.
// They target the production build of the `ssr-lab` project, served on port 4400.
import { readFile } from 'node:fs/promises';
import type { APIRequestContext, Page } from '@playwright/test';

export const SSR_ORIGIN = 'http://localhost:4400';

/** Root of the `ssr-lab` production build: `browser/` and `server/` sit here. */
const DIST = new URL('../../../../angular/dist/ssr-lab/', import.meta.url);

/** A response as the server sent it, before any JavaScript runs. */
export interface RawHtml {
  status: number;
  headers: Record<string, string>;
  body: string;
}

/** Requests a path from the SSR server with no browser, so the body is the server's HTML. */
export async function rawHtml(request: APIRequestContext, path: string): Promise<RawHtml> {
  const response = await request.get(new URL(path, SSR_ORIGIN).href);
  return { status: response.status(), headers: response.headers(), body: await response.text() };
}

/** Holds every script request whose URL matches `pattern`; calling `release()` lets them through. */
export async function holdScripts(page: Page, pattern: RegExp): Promise<() => Promise<void>> {
  const held: (() => Promise<void>)[] = [];
  await page.route(pattern, (route) => {
    if (route.request().resourceType() !== 'script') return route.continue();
    return new Promise<void>((resolve) => {
      held.push(async () => {
        await route.continue();
        resolve();
      });
    });
  });
  return async () => {
    await Promise.all(held.splice(0).map((release) => release()));
    await page.unroute(pattern);
  };
}

/** Records the URLs of requested scripts that match `pattern`, in request order. */
export function scriptRequests(page: Page, pattern: RegExp): string[] {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script' && pattern.test(request.url())) urls.push(request.url());
  });
  return urls;
}

/** Records the browser's requests whose path starts with `/api`, as `METHOD path`. */
export function apiRequests(page: Page): string[] {
  const calls: string[] = [];
  page.on('request', (request) => {
    const { pathname, search } = new URL(request.url());
    if (pathname.startsWith('/api')) calls.push(`${request.method()} ${pathname}${search}`);
  });
  return calls;
}

/** Records the text of console messages of type `error`. */
export function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** Reads a file of the production build, relative to `labs/angular/dist/ssr-lab` (e.g. `'server/server.mjs'`). */
export async function distFile(path: string): Promise<string> {
  try {
    return await readFile(new URL(path, DIST), 'utf8');
  } catch {
    throw new Error(`dist/ssr-lab/${path} is missing: build it with "npm --prefix ../angular run build -- ssr-lab"`);
  }
}

/** Parses the JSON of the serialized state script (`<script id="ng-state" type="application/json">`). */
export function stateScript(html: string): unknown {
  const match = /<script id="ng-state" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  if (!match) throw new Error('no ng-state script in the HTML');
  return JSON.parse(match[1]);
}
