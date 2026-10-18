import { expect, test } from '@playwright/test';
import { runtimeUrl } from '../support/i18n.js';

// Section 8 of module 34: the runtime build (`ng build i18n-lab -c production,runtime`, localize off, served at
// `/runtime/` by the lab's own server). Page: labs/angular/projects/i18n-lab/src/app/m34/runtime/runtime.ts at
// `m34/runtime`; `main.runtime.ts` reads `?lang=`, fetches `i18n/<lang>.json` and calls `loadTranslations` before bootstrap.

const PATH = 'm34/runtime';

test('Section 8: the runtime build renders French with lang=fr in the URL', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US', timezoneId: 'UTC' });
  const page = await context.newPage();
  await page.goto(runtimeUrl('fr', PATH));

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Traduction à l’exécution');
  await expect(page.getByTestId('greeting')).toHaveText('2 nouveaux messages pour Ana');
  await expect(page.getByTestId('locale-id')).toHaveText('fr');
  await context.close();
});

test('Section 8: switching language in the runtime build reloads the page', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US', timezoneId: 'UTC' });
  const page = await context.newPage();
  await page.goto(runtimeUrl('en', PATH));
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Runtime translation');
  await expect(page.getByTestId('locale-id')).toHaveText('en-US');
  await page.evaluate(() => Object.defineProperty(window, 'labPageMarker', { value: true, configurable: true }));
  expect(await page.evaluate(() => 'labPageMarker' in window)).toBe(true);

  await page.getByRole('link', { name: 'Français' }).click();

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Traduction à l’exécution');
  expect(page.url()).toContain('?lang=fr');
  expect(await page.evaluate(() => 'labPageMarker' in window)).toBe(false);
  await context.close();
});

test('Section 8: the runtime build requests the translation file before the app renders', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US', timezoneId: 'UTC' });
  const page = await context.newPage();
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/runtime/i18n/fr.json', async (route) => {
    await held;
    await route.continue();
  });
  const requested = page.waitForRequest('**/runtime/i18n/fr.json');
  await page.goto(runtimeUrl('fr', PATH), { waitUntil: 'commit' });

  await requested;
  await expect(page.locator('lab-m34-runtime')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
  release();

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Traduction à l’exécution');
  await context.close();
});
