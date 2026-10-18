// Section 10: what the engine writes into the HTML per render mode, on the production build of `ssr-lab` (port 4400).
// It reuses SEC-M32-03's pages: `m32/routes/prerendered` (Prerender), `m32/routes/server` (Server), `m32/routes/client` (Client).
import { expect, test } from '@playwright/test';
import { holdScripts, rawHtml, SSR_ORIGIN, stateScript } from '../support/ssr.js';

const PAGES = '/m32/routes';
const MAIN = /\/main-[^/]*\.js$/;

test('Section 10: the root element carries ng-server-context naming the render mode', async ({ request }) => {
  const prerendered = await rawHtml(request, `${PAGES}/prerendered`);
  const server = await rawHtml(request, `${PAGES}/server`);
  const client = await rawHtml(request, `${PAGES}/client`);

  expect(prerendered.body).toContain('<lab-root ng-version="22.2.1" ngh="1" ng-server-context="ssg">');
  expect(server.body).toContain('<lab-root ng-version="22.2.1" ngh="1" ng-server-context="ssr">');
  // A Client route is never rendered: the shell's root element is empty and the body carries `ngcm`.
  expect(client.body).toContain('<lab-root></lab-root>');
  expect(client.body).toContain('<body ngcm="">');
  expect(client.body).not.toContain('ng-server-context');
});

test('Section 10: the integrity marker comment opens the body', async ({ request }) => {
  const prerendered = await rawHtml(request, `${PAGES}/prerendered`);
  const server = await rawHtml(request, `${PAGES}/server`);
  const client = await rawHtml(request, `${PAGES}/client`);

  // Inserted before the event contract script, which the build had put first.
  expect(prerendered.body).toContain('<body><!--nghm--><script type="text/javascript" id="ng-event-dispatch-contract">');
  expect(server.body).toContain('<body><!--nghm--><script type="text/javascript" id="ng-event-dispatch-contract">');
  expect(client.body).not.toContain('nghm');
  expect(client.body).not.toContain('id="ng-state"');
});

test('Section 10: the state script holds the hydration annotations under __nghData__', async ({ request, page }) => {
  const { body } = await rawHtml(request, `${PAGES}/server`);
  // Each `ngh` value is an index into `__nghData__`. Entry 1 (the root) records a container (`c`) at template slot 5,
  // the router outlet, holding one view: `i` is its template id (a generated hash), `r` its number of root nodes.
  expect(body).toContain('<lab-m32-routes-page ngh="0"><h2>Route page: server</h2>');
  expect(stateScript(body)).toEqual({
    __nghData__: [{}, { c: { '5': [{ i: expect.stringMatching(/^c\d+$/), r: 1 }] } }],
  });

  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}${PAGES}/server`, { waitUntil: 'commit' });
  const root = page.locator('lab-root');
  await expect(root).toHaveAttribute('ngh', '1');

  await release();
  // The client removes each annotation once it has claimed that host.
  await expect(root).not.toHaveAttribute('ngh');
  await expect(page.locator('lab-m32-routes-page')).not.toHaveAttribute('ngh');
  await expect(root).toHaveAttribute('ng-server-context', 'ssr');
});
