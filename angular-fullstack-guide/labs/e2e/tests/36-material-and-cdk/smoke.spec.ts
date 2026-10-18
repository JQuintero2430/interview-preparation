import { expect, test, type Browser, type Page } from '@playwright/test';
import { activeElement, computed, liveText, rect, sysVar, topLayer, UI_ORIGIN } from './support/ui.js';

async function open(browser: Browser, colorScheme: 'light' | 'dark'): Promise<Page> {
  const context = await browser.newContext({ colorScheme, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Module 36 Material and CDK lab' })).toBeVisible();
  return page;
}

/** `--mat-sys-primary` is a `light-dark()` string; a probe element resolves it to the color the browser picks. */
async function resolvedPrimary(page: Page): Promise<string> {
  return page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--mat-sys-primary)';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
}

test('Smoke: the Material lab serves the home page with the theme applied', async ({ browser }) => {
  const page = await open(browser, 'light');
  expect(await sysVar(page, '--mat-sys-primary')).not.toBe('');
  const button = page.getByRole('button', { name: 'Save' });
  expect(await computed(button, 'background-color')).toBe(await resolvedPrimary(page));
  await page.context().close();
});

test('Smoke: the Material lab loads no font or icon from the network', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  await page.goto(`${UI_ORIGIN}/`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) expect(url.startsWith(UI_ORIGIN)).toBe(true);
  await context.close();
});

test('Smoke: the theme follows the color scheme of the context', async ({ browser }) => {
  const light = await open(browser, 'light');
  const dark = await open(browser, 'dark');
  expect(await resolvedPrimary(light)).not.toBe(await resolvedPrimary(dark));
  await light.context().close();
  await dark.context().close();
});

test('Smoke: the form field input takes focus and has a layout box', async ({ browser }) => {
  const page = await open(browser, 'light');
  const input = page.getByRole('textbox', { name: 'Name' });
  await input.focus();
  expect((await activeElement(page)).tag).toBe('input');
  expect((await rect(input)).width).toBeGreaterThan(0);
  await page.context().close();
});

test('Smoke: the home page has nothing in the top layer and no announcer text', async ({ browser }) => {
  const page = await open(browser, 'light');
  expect(await topLayer(page)).toEqual([]);
  expect(await liveText(page)).toEqual([]);
  await page.context().close();
});
