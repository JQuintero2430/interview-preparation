import { expect, test } from '@playwright/test';
import { I18N_ORIGIN, localeUrl, type I18nLocale } from '../support/i18n.js';

// Output questions of module 34 that run in the browser. Each test is named after its question ID.
// The pages are the home page of the `i18n-lab` build in each locale folder (read-only here); the redirect on `/`
// is the lab's own server (labs/e2e/server/i18n-server.mjs), not an Angular feature. Every context sets `locale` and `timezoneId`.

const HOME: Record<'fr' | 'ar', { title: string; dir: 'ltr' | 'rtl' }> = {
  fr: { title: 'Laboratoire i18n du module 34', dir: 'ltr' },
  ar: { title: 'مختبر i18n للوحدة 34', dir: 'rtl' },
};

test('Q34.18 / with Accept-Language fr answers 302 to /fr/ with Vary, /fr/ and /ar/ carry their lang, dir and heading', async ({ browser, request }) => {
  const redirect = await request.get(`${I18N_ORIGIN}/`, { headers: { 'Accept-Language': 'fr' }, maxRedirects: 0 });
  expect(redirect.status()).toBe(302);
  expect(redirect.headers()['location']).toBe('/fr/');
  expect(redirect.headers()['vary']).toBe('Accept-Language');

  for (const locale of ['fr', 'ar'] as const satisfies readonly I18nLocale[]) {
    const expected = HOME[locale];
    // The served HTML already says which language and direction it is, before any script runs.
    const html = await (await request.get(localeUrl(locale))).text();
    expect(html, locale).toContain(`<html lang="${locale}" dir="${expected.dir}"`);

    const context = await browser.newContext({ locale, timezoneId: 'UTC' });
    const page = await context.newPage();
    await page.goto(localeUrl(locale));
    await expect(page.getByRole('heading', { level: 1, name: expected.title }), locale).toBeVisible();
    await expect(page.locator('html'), locale).toHaveAttribute('lang', locale);
    await expect(page.locator('html'), locale).toHaveAttribute('dir', expected.dir);
    await context.close();
  }
});

// Q34.24 reuses the lab's `m34/rtl` page (section 11, read-only here): a 300 px frame holds a 100 px box with
// `margin-left: 16px` (physical) or `margin-inline-start: 16px` (logical), and one paragraph has `text-align: start`.
// Measured in Chromium with an 800 px viewport; the `ng test` half of the question is in the Angular outputs spec.
test('Q34.24 / in the ar build margin-left keeps its margin on the box left, margin-inline-start puts 16 px at the right edge and text-align start aligns right', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ar', timezoneId: 'UTC', viewport: { width: 800, height: 600 } });
  const page = await context.newPage();
  await page.goto(localeUrl('ar', 'm34/rtl'));
  await expect(page.getByTestId('start')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const gaps = (kind: 'physical' | 'logical'): Promise<{ left: number; right: number }> =>
    page.evaluate((id) => {
      const frame = document.querySelector(`[data-testid="${id}-frame"]`)!.getBoundingClientRect();
      const box = document.querySelector(`[data-testid="${id}-box"]`)!.getBoundingClientRect();
      return { left: Math.round(box.left - frame.left), right: Math.round(frame.right - box.right) };
    }, kind);

  // Both rows start at the right edge. The logical margin is at the start (the right), the physical one on the box's left.
  expect(await gaps('logical')).toEqual({ left: 184, right: 16 });
  expect(await gaps('physical')).toEqual({ left: 200, right: 0 });
  expect(await page.getByTestId('physical-box').evaluate((box) => getComputedStyle(box).marginLeft)).toBe('16px');

  const text = await page.getByTestId('start').evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const inner = range.getBoundingClientRect();
    const outer = element.getBoundingClientRect();
    return { left: Math.round(inner.left - outer.left), right: Math.round(outer.right - inner.right) };
  });
  expect(text.right).toBe(0);
  expect(text.left).toBeGreaterThan(0);
  await context.close();
});
