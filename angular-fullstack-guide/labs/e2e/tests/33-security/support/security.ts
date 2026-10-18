// Shared helpers for module 33 (HOUSE-29). Read-only to every module-33 task.
// They target the production builds of the `security-lab` project served by server/security-server.mjs on port 4500.
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { APIRequestContext, BrowserContext, Page } from '@playwright/test';

declare global {
  interface Window {
    /** Exposed by `cspViolations`. */
    __m33RecordViolation?: (violation: CspViolation) => void;
  }
}

/** The lab's own site. */
export const SEC_ORIGIN = 'http://localhost:4500';
/** The same server reached as another site: `localhost` and `127.0.0.1` are two sites for the browser. */
export const ATTACKER_ORIGIN = 'http://127.0.0.1:4500';

/** Root of the production builds: `<project>/browser/` sits here. */
const DIST = new URL('../../../../angular/dist/', import.meta.url);

/** What `GET /__log?run=<id>` returns: the run's CSP reports and the entries route modules logged with `ctx.log`. */
export interface ServerLog {
  reports: { contentType: 'application/csp-report' | 'application/reports+json'; report: unknown }[];
  requests: unknown[];
}

/** One `securitypolicyviolation` event, as the page saw it. */
export interface CspViolation {
  violatedDirective: string;
  blockedURI: string;
  disposition: string;
}

/** Starts an isolated run: sets the `m33-run` cookie on both hosts and returns its id (server state is keyed by it). */
export async function newRun(context: BrowserContext): Promise<string> {
  const run = randomUUID();
  await context.addCookies(
    [SEC_ORIGIN, ATTACKER_ORIGIN].map((origin) => ({ name: 'm33-run', value: run, url: origin })),
  );
  return run;
}

/** Reads the server's log for a run: CSP reports posted to `/__csp-report?run=<id>` and route-module entries. */
export async function serverLog(request: APIRequestContext, run: string): Promise<ServerLog> {
  const response = await request.get(`${SEC_ORIGIN}/__log?run=${encodeURIComponent(run)}`);
  if (!response.ok()) throw new Error(`GET /__log answered ${response.status()}`);
  const log: ServerLog = await response.json();
  return log;
}

/**
 * Records every `securitypolicyviolation` event of every document the page loads (an init script, so it runs
 * before the page's own scripts). The array fills asynchronously: read it with `expect.poll` or after a wait.
 */
export async function cspViolations(page: Page): Promise<CspViolation[]> {
  const violations: CspViolation[] = [];
  await page.exposeFunction('__m33RecordViolation', (violation: CspViolation) => void violations.push(violation));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) =>
      window.__m33RecordViolation?.({ violatedDirective: event.violatedDirective, blockedURI: event.blockedURI, disposition: event.disposition }),
    );
  });
  return violations;
}

/** Records the text of console messages of type `error`. */
export function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/**
 * Fetches every script an HTML document references (`<script src>`, `<link rel="modulepreload">` and the file names
 * in the autoCsp loader) and returns their text joined. Relative URLs resolve against the document's `<base href>`.
 */
export async function bundleText(request: APIRequestContext, html: string): Promise<string> {
  const base = new URL(/<base href="([^"]*)"/.exec(html)?.[1] ?? '/', SEC_ORIGIN);
  const tagged = [...html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+\.js)"/g)].map((match) => match[1]);
  const loaded = [...html.matchAll(/\['([^']+\.js)',/g)].map((match) => match[1]);
  const urls = [...new Set([...tagged, ...loaded])].map((path) => new URL(path, base).href);
  const texts = await Promise.all(
    urls.map(async (url) => {
      const response = await request.get(url);
      if (!response.ok()) throw new Error(`GET ${url} answered ${response.status()}`);
      return response.text();
    }),
  );
  return texts.join('\n');
}

/**
 * Reads a file of a production build, relative to `labs/angular/dist/<project>`
 * (e.g. `distFile('security-lab', 'browser/index.html')`). Returns the bytes; call `.toString('utf8')` for text.
 */
export async function distFile(project: string, path: string): Promise<Buffer> {
  try {
    return await readFile(new URL(`${project}/${path}`, DIST));
  } catch {
    throw new Error(`dist/${project}/${path} is missing: run the e2e suite (its web server builds security-lab) or "npx ng build security-lab"`);
  }
}

/** The base64 SHA-384 digest, as written after `sha384-` in an `integrity` attribute. */
export function sha384Base64(buffer: Uint8Array | string): string {
  return createHash('sha384').update(buffer).digest('base64');
}
