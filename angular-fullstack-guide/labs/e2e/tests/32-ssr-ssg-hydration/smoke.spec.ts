import { expect, test } from '@playwright/test';
import { rawHtml } from './support/ssr.js';

test('Smoke: the module 32 SSR lab serves server-rendered HTML', async ({ request }) => {
  const { status, body } = await rawHtml(request, '/');

  expect(status).toBe(200);
  expect(body).toContain('<h2>Module 32 SSR lab</h2>');
  expect(body).toContain('id="ng-state"');
});

test('Smoke: the generated config enables event replay without withEventReplay', async ({ request }) => {
  const { body } = await rawHtml(request, '/');

  expect(body).toContain('id="ng-event-dispatch-contract"');
  expect(body).toContain('__jsaction_bootstrap(document.body,"ng",["click"],[])');
  expect(body).toContain('jsaction="click:;"');
});
