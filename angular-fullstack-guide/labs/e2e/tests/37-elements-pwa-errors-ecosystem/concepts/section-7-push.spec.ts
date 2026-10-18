import { expect, test } from '@playwright/test';
import { ORIGIN, swContext, waitForController } from '../support/sw.js';

// The push service is the browser's, so the test never reaches one: it hands the worker a push through the DevTools Protocol
// (`ServiceWorker.deliverPushMessage`), which needs the registration id the protocol reports for the page's worker.

test('Section 7: a push message delivered to the worker reaches SwPush.messages in the page', async ({ browser }) => {
  const context = await swContext(browser);
  await context.grantPermissions(['notifications'], { origin: ORIGIN });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const registrations: string[] = [];
  cdp.on('ServiceWorker.workerRegistrationUpdated', ({ registrations: updated }) => {
    for (const registration of updated) {
      if (registration.scopeURL === `${ORIGIN}/` && !registrations.includes(registration.registrationId)) registrations.push(registration.registrationId);
    }
  });
  await cdp.send('ServiceWorker.enable');

  await page.goto(`${ORIGIN}/m37/push`);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await waitForController(page);
  await expect(page.getByTestId('push-enabled')).toHaveText('SwPush enabled: true');
  await expect.poll(() => registrations.length).toBeGreaterThan(0);

  const payload = { notification: { title: 'Module 37 push', body: 'delivered through the protocol' }, id: 'm37-push-1' };
  await cdp.send('ServiceWorker.deliverPushMessage', { origin: ORIGIN, registrationId: registrations[0] ?? '', data: JSON.stringify(payload) });

  await expect(page.getByTestId('last-push')).toHaveText(JSON.stringify(payload));
  await context.close();
});

test('Section 7: the lab serves a manifest linked from index.html', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`);

  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('manifest.webmanifest');
  const response = await context.request.get(`${ORIGIN}/${href}`);
  expect(response.ok()).toBe(true);
  const manifest: { display?: string } = await response.json();
  expect(manifest.display).toBe('standalone');
  await context.close();
});
