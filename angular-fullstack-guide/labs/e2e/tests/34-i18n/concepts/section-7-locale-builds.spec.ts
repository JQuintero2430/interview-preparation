import { readdir } from 'node:fs/promises';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { distFile, I18N_ORIGIN, LOCALES, localeUrl, type I18nLocale } from '../support/i18n.js';

// Section 7 of module 34: what one `ng build i18n-lab` (`localize: true`, locales en-US, fr and ar) writes and serves.
// Page: labs/angular/projects/i18n-lab/src/app/m34/builds/builds.ts at `m34/builds/:id` in every locale folder.
// The redirect on `/` is the lab's own server (labs/e2e/server/i18n-server.mjs), not an Angular feature.

const BROWSER_DIR = new URL('../../../../angular/dist/i18n-lab/browser/', import.meta.url);
const DIR: Record<I18nLocale, 'ltr' | 'rtl'> = { 'en-US': 'ltr', fr: 'ltr', ar: 'rtl' };
const FRENCH_TITLE = 'Détails de la commande';
const ENGLISH_TITLE = 'Order details';

async function openBuildsPage(browser: Browser, locale: I18nLocale, id = '42'): Promise<Page> {
  const context = await browser.newContext({ locale, timezoneId: 'UTC' });
  const page = await context.newPage();
  await page.goto(localeUrl(locale, `m34/builds/${id}`));
  await expect(page.getByTestId('router-url')).toHaveText(`/m34/builds/${id}`);
  return page;
}

test('Section 7: each locale build sets lang and dir on html', async ({ browser }) => {
  for (const locale of LOCALES) {
    const page = await openBuildsPage(browser, locale);
    await expect(page.locator('html'), locale).toHaveAttribute('lang', locale);
    await expect(page.locator('html'), locale).toHaveAttribute('dir', DIR[locale]);
    await page.context().close();
  }
});

test('Section 7: each locale build sets its base href', async ({ browser }) => {
  for (const locale of LOCALES) {
    const page = await openBuildsPage(browser, locale);
    await expect(page.locator('head base'), locale).toHaveAttribute('href', `/${locale}/`);
    await page.context().close();
  }
});

test('Section 7: a deep link under fr renders the French page with the same router URL', async ({ browser }) => {
  const french = await openBuildsPage(browser, 'fr');
  const english = await openBuildsPage(browser, 'en-US');

  await expect(french.getByRole('heading', { level: 2 })).toHaveText(FRENCH_TITLE);
  await expect(english.getByRole('heading', { level: 2 })).toHaveText(ENGLISH_TITLE);
  expect(french.url()).toBe(`${I18N_ORIGIN}/fr/m34/builds/42`);
  await expect(french.getByTestId('router-url')).toHaveText(await english.getByTestId('router-url').innerText());
  await french.context().close();
  await english.context().close();
});

test("Section 7: LOCALE_ID equals the build's locale", async ({ browser }) => {
  for (const locale of LOCALES) {
    const page = await openBuildsPage(browser, locale);
    await expect(page.getByTestId('locale-id'), locale).toHaveText(locale);
    await page.context().close();
  }
});

test('Section 7: the lab server redirects / to the preferred locale with Vary Accept-Language', async ({ request }) => {
  const cases = [
    { acceptLanguage: 'fr-CA,fr;q=0.9,en;q=0.8', location: '/fr/' },
    { acceptLanguage: 'ar-EG', location: '/ar/' },
    { acceptLanguage: 'de-DE,de;q=0.9', location: '/en-US/' },
  ];
  for (const { acceptLanguage, location } of cases) {
    const response = await request.get(`${I18N_ORIGIN}/`, { headers: { 'Accept-Language': acceptLanguage }, maxRedirects: 0 });
    expect(response.status(), acceptLanguage).toBe(302);
    expect(response.headers()['location'], acceptLanguage).toBe(location);
    expect(response.headers()['vary'], acceptLanguage).toBe('Accept-Language');
  }
});

test('Section 7: the build writes one folder per locale', async () => {
  const folders = (await readdir(BROWSER_DIR, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  expect(folders.sort()).toEqual(['ar', 'en-US', 'fr']);
  for (const locale of LOCALES) {
    const html = (await distFile(`i18n-lab/browser/${locale}/index.html`)).toString('utf8');
    expect(html, locale).toContain(`<html lang="${locale}"`);
  }
});

test('Section 7: a locale build has no runtime translation lookup', async () => {
  const folder = new URL('fr/', BROWSER_DIR);
  const scripts = (await readdir(folder)).filter((name) => name.endsWith('.js'));
  const code = (await Promise.all(scripts.map((name) => distFile(`i18n-lab/browser/fr/${name}`)))).map((bytes) => bytes.toString('utf8')).join('\n');

  expect(code).toContain(`"${FRENCH_TITLE}"`);
  expect(code).not.toContain(ENGLISH_TITLE);
  expect(code).not.toContain('loadTranslations');
  expect(code).not.toContain('$localize`');
});
