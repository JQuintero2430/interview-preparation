import type { Page } from '@playwright/test';

/** One scripted answer to the next `GET /api/todos`. An omitted body is an empty list. */
export interface ScriptedResponse {
  status?: number;
  delayMs?: number;
  body?: unknown;
}

/** What a test may ask of its backend, whoever plays the backend. */
export interface BackendController {
  respondWith(response: ScriptedResponse): Promise<void>;
  /** API calls the test did not script, as `METHOD /path?query`. */
  unexpectedCalls(): Promise<string[]>;
}

export type BackendKind = 'route' | 'server';

const LIST_URL = /\/api\/todos(\?.*)?$/;
const LIST_CALL = /^GET \/api\/todos(\?|$)/;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The browser answers: `page.route` handlers, the catch-all registered first so it runs last. */
async function routeBackend(page: Page): Promise<BackendController> {
  let next: ScriptedResponse | undefined;
  const unexpected: string[] = [];

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    unexpected.push(`${route.request().method()} ${url.pathname}${url.search}`);
    await route.abort();
  });
  await page.route(LIST_URL, async (route) => {
    const scripted = route.request().method() === 'GET' ? next : undefined;
    if (!scripted) {
      await route.fallback();
      return;
    }
    next = undefined;
    await sleep(scripted.delayMs ?? 0);
    await route.fulfill({
      status: scripted.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(scripted.body ?? []),
    });
  });

  return {
    respondWith: async (response) => {
      next = response;
    },
    unexpectedCalls: async () => [...unexpected],
  };
}

/** The stub server answers: its per-tenant scenario endpoint scripts the reply and its log records the calls. */
async function serverBackend(page: Page, tenant: string): Promise<BackendController> {
  let scripted = 0;
  await page.context().addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
  await page.request.post('/api/__reset', { data: [] });

  return {
    respondWith: async (response) => {
      scripted += 1;
      await page.request.post('/api/__scenario', { data: response });
    },
    unexpectedCalls: async () => {
      const log: { method: string; url: string }[] = await (await page.request.get('/api/__log')).json();
      let allowance = scripted;
      return log
        .map((entry) => `${entry.method} ${entry.url}`)
        .filter((call) => !(LIST_CALL.test(call) && allowance-- > 0));
    },
  };
}

export function createBackend(kind: BackendKind, page: Page, tenant: string): Promise<BackendController> {
  return kind === 'route' ? routeBackend(page) : serverBackend(page, tenant);
}
