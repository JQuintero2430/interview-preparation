import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { ORIGIN, deploy, swContext, swState, waitForController } from '../support/sw.js';

// The worker answers `/ngsw/state` itself (its debug page), so the test reads it through the controlled page.
// The worker names a version by the SHA-1 of `JSON.stringify(manifest)` (`hashManifest` in ngsw-worker.js 22.2.1);
// the test recomputes it from the `ngsw.json` the server sends (ASCII only, so UTF-8 bytes equal the worker's char codes).

test('Section 13: the ngsw/state page reports the driver state and the active version hash', async ({ browser }) => {
  const context = await swContext(browser);
  await deploy(context, 'v1');
  const manifestText = await (await context.request.get(`${ORIGIN}/ngsw.json`)).text();
  const expectedHash = createHash('sha1').update(JSON.stringify(JSON.parse(manifestText))).digest('hex');

  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);

  await expect.poll(() => swState(page)).toContain(`Latest manifest hash: ${expectedHash}`);
  const lines = (await swState(page)).split('\n');
  expect(lines).toContain('Driver version: 22.2.1');
  expect(lines).toContain('Driver state: NORMAL ((nominal))');
  expect(lines).toContain(`=== Version ${expectedHash} ===`);
  expect(lines.filter((line) => line.startsWith('=== Version '))).toHaveLength(1);
  const clients = lines.find((line) => line.startsWith('Clients: ')) ?? '';
  expect(clients.slice('Clients: '.length).trim()).not.toBe('');
  await context.close();
});
