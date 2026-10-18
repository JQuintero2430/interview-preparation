import { expect, test } from '@playwright/test';
import { consoleMessages, LOCALES, localeUrl, runtimeUrl, type I18nLocale } from './support/i18n.js';

const HOME: Record<I18nLocale, { title: string; dir: 'ltr' | 'rtl' }> = {
  'en-US': { title: 'Module 34 i18n lab', dir: 'ltr' },
  fr: { title: 'Laboratoire i18n du module 34', dir: 'ltr' },
  ar: { title: 'مختبر i18n للوحدة 34', dir: 'rtl' },
};

test('Smoke: each locale build serves its translated home page with lang and dir', async ({ browser }) => {
  for (const locale of LOCALES) {
    const expected = HOME[locale];
    const context = await browser.newContext({ locale, timezoneId: 'UTC' });
    const page = await context.newPage();
    const messages = consoleMessages(page);

    await page.goto(localeUrl(locale));

    await expect(page.getByRole('heading', { level: 1, name: expected.title })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', expected.dir);
    expect(messages.filter((message) => message.type === 'error')).toEqual([]);
    await context.close();
  }
});

test('Smoke: the runtime build loads French translations before bootstrap', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'fr', timezoneId: 'UTC' });
  const page = await context.newPage();
  const messages = consoleMessages(page);

  await page.goto(runtimeUrl('fr'));

  await expect(page.getByRole('heading', { level: 1, name: HOME.fr.title })).toBeVisible();
  expect(messages.filter((message) => message.type === 'error')).toEqual([]);
  await context.close();
});
