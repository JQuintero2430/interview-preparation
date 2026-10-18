// Section 7: request data in server-rendered HTML. The pages live in `ssr-lab` (production build, port 4400) under
// /m33/ssr and are RenderMode.Server; the tests read the HTML as the server sent it, before any JavaScript runs.
import { expect, test } from '@playwright/test';
import { rawHtml, SSR_ORIGIN, stateScript } from '../../32-ssr-ssg-hydration/support/ssr.js';

const ECHO = '/m33/ssr/echo';
const STATE = '/m33/ssr/state';

test('Section 7: a server-rendered interpolation escapes markup in the raw HTML', async ({ request }) => {
  const { body } = await rawHtml(request, `${ECHO}?q=${encodeURIComponent('<b>bold</b><script>x</script>')}`);

  const region = /<output aria-label="Interpolation">(.*?)<\/output>/.exec(body)?.[1];
  expect(region).toBe('&lt;b&gt;bold&lt;/b&gt;&lt;script&gt;x&lt;/script&gt;');
});

test('Section 7: an [innerHTML] binding is sanitized in the server HTML', async ({ request }) => {
  const payload = '<b>bold</b><img src=x onerror=window.__m33Hits=1><script>x</script>';
  const { body } = await rawHtml(request, `${ECHO}?q=${encodeURIComponent(payload)}`);

  // The markup that is safe stays; the handler attribute and the script element are gone before the browser sees them.
  expect(body).toContain('<output aria-label="innerHTML binding"><b>bold</b><img src="x"></output>');
  expect(body).not.toContain('<img src=x onerror');
});

test('Section 7: the state script escapes a closing script tag', async ({ page, request }) => {
  const value = '</script><script>window.__m33Hits=1</script>';
  const { body } = await rawHtml(request, `${STATE}?q=${encodeURIComponent(value)}`);

  // JSON.parse undoes the escapes, so the stored value is intact; the raw text has no `<` or `/` of its own.
  expect(stateScript(body)).toMatchObject({ 'lab-display-name': value });
  expect(body).toContain('"lab-display-name":"\\u003C\\u002Fscript>\\u003Cscript>window.__m33Hits=1\\u003C\\u002Fscript>"');
  expect(body).not.toContain('</script><script>window.__m33Hits');
  expect(body).toContain(`<output aria-label="Display name">&lt;/script&gt;&lt;script&gt;window.__m33Hits=1&lt;/script&gt;</output>`);

  // In the browser the value is read back as text and nothing runs.
  await page.goto(`${SSR_ORIGIN}${STATE}?q=${encodeURIComponent(value)}`);
  await expect(page.getByLabel('Display name')).toHaveText(value);
  expect(await page.evaluate(() => Reflect.get(window, '__m33Hits'))).toBeUndefined();
});

test('Section 7: a reflected request header is escaped in the server HTML', async ({ request }) => {
  const response = await request.get(new URL(ECHO, SSR_ORIGIN).href, {
    headers: { 'X-Lab-Name': '<img src=x onerror=window.__m33Hits=1>' },
  });
  const body = await response.text();

  expect(body).toContain('<output aria-label="Request header">&lt;img src=x onerror=window.__m33Hits=1&gt;</output>');
  expect(body).not.toContain('<img src=x onerror');
});
