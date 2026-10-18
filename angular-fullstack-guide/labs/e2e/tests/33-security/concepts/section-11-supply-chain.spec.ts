// Section 11: Subresource Integrity on the production build of security-lab (nonce build). The build writes a
// `sha384-` digest into the `integrity` attribute of each initial script, stylesheet and modulepreload link, and
// an import map with one digest per lazy chunk. The tampered-bundle test edits the response with `page.route`.
import { readdir } from 'node:fs/promises';
import { expect, test, type BrowserContext } from '@playwright/test';
import { consoleErrors, distFile, newRun, SEC_ORIGIN, sha384Base64 } from '../support/security.js';

const MARKER = 'LAB_M33_ADMIN_CHUNK';

/** One `integrity` attribute and the file it names, as the served HTML spells them. */
interface Pinned {
  file: string;
  integrity: string;
}

/** Every file the served HTML pins: `src`/`href` plus `integrity` on a tag, and the entries of the import map. */
function pinnedFiles(html: string): { tags: Pinned[]; map: Pinned[] } {
  const tags = [...html.matchAll(/<(?:script|link)\b[^>]*>/g)].flatMap(([tag]) => {
    const file = /\b(?:src|href)="([^"]+)"/.exec(tag)?.[1];
    const integrity = /\bintegrity="([^"]+)"/.exec(tag)?.[1];
    return file !== undefined && integrity !== undefined ? [{ file, integrity }] : [];
  });
  const json = /<script type="importmap"[^>]*>([^<]*)<\/script>/.exec(html)?.[1] ?? '{}';
  const parsed: { integrity?: Record<string, string> } = JSON.parse(json);
  const map = Object.entries(parsed.integrity ?? {}).map(([file, integrity]) => ({ file, integrity }));
  return { tags, map };
}

test('Section 11: the built index.html carries integrity attributes that match the served scripts', async ({ context }) => {
  await newRun(context);
  const built = (await distFile('security-lab', 'browser/index.html')).toString('utf8');
  const served = await (await context.request.get(`${SEC_ORIGIN}/`)).text();
  const { tags, map } = pinnedFiles(served);
  // The nonce build pins the main script, the stylesheet and the modulepreload link; the map pins every lazy chunk.
  expect(tags.map((tag) => tag.file).sort()).toEqual([...built.matchAll(/(?:src|href)="((?:main|styles|chunk)-[^"]+)"/g)].map((match) => match[1]).sort());
  expect(tags.some((tag) => tag.file.startsWith('main-') && tag.file.endsWith('.js'))).toBe(true);
  expect(map.length).toBeGreaterThan(0);
  for (const { file, integrity } of [...tags, ...map]) {
    expect(integrity, file).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
    const body = await (await context.request.get(`${SEC_ORIGIN}/${file.replace(/^\.\//, '')}`)).body();
    expect(`sha384-${sha384Base64(body)}`, file).toBe(integrity);
  }
});

test('Section 11: a tampered main bundle is refused and the app does not boot', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  // Control: the untouched build boots.
  await page.goto(`${SEC_ORIGIN}/`);
  await expect(page.getByRole('heading', { name: 'Module 33 security lab' })).toBeVisible();
  expect(errors).toEqual([]);
  // The same build with one byte appended to the main bundle's response.
  const tampered = await context.newPage();
  const tamperedErrors = consoleErrors(tampered);
  await tampered.route(/\/main-[^/]+\.js$/, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()} ` });
  });
  await tampered.goto(`${SEC_ORIGIN}/`);
  await expect.poll(() => tamperedErrors.length).toBeGreaterThan(0);
  expect(tamperedErrors.join('\n')).toContain('Failed to find a valid digest in the \'integrity\' attribute');
  expect(tamperedErrors.join('\n')).toContain('The resource has been blocked.');
  await expect(tampered.getByRole('heading', { name: 'Module 33 security lab' })).toHaveCount(0);
  await expect(tampered.locator('lab-root')).toBeEmpty();
});

/** The file name of the lazy chunk that holds the admin page (module 10's marker). */
async function lazyChunk(): Promise<string> {
  const files = (await readdir(new URL('../../../../angular/dist/security-lab/browser/', import.meta.url))).filter((name) => name.endsWith('.js'));
  const holders: string[] = [];
  for (const name of files) {
    if ((await distFile('security-lab', `browser/${name}`)).toString('utf8').includes(MARKER)) holders.push(name);
  }
  expect(holders).toHaveLength(1);
  return holders[0] ?? '';
}

/**
 * Opens `path` with the lazy chunk's response edited (one byte appended), optionally with the document's `<base>`
 * moved to the start of `<head>`, then imports the chunk the way the router would. Returns whether it ran.
 */
async function importTamperedChunk(context: BrowserContext, path: string, baseFirst: boolean): Promise<'ran' | 'refused'> {
  const chunk = await lazyChunk();
  const page = await context.newPage();
  const errors = consoleErrors(page);
  await page.route(`${SEC_ORIGIN}/${chunk}`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()} ` });
  });
  if (baseFirst) {
    await page.route(`${SEC_ORIGIN}${path}`, async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace('<base href="/">', '').replace('<head>', '<head><base href="/">');
      await route.fulfill({ response, body: html });
    });
  }
  await page.goto(`${SEC_ORIGIN}${path}`);
  const outcome = await page.evaluate(async (url) => import(url).then(() => 'ran' as const, () => 'refused' as const), `/${chunk}`);
  expect(errors.some((text) => text.includes("Failed to find a valid digest in the 'integrity' attribute"))).toBe(outcome === 'refused');
  return outcome;
}

test('Section 11: the import map checks a lazy chunk from the root URL but not on a deep link', async ({ context }) => {
  await newRun(context);
  expect(await importTamperedChunk(context, '/', false)).toBe('refused');
  expect(await importTamperedChunk(context, '/m33/guards', false)).toBe('ran');
  // The build writes the map before <base href="/">: with <base> first, the same deep link checks the chunk.
  expect(await importTamperedChunk(context, '/m33/guards', true)).toBe('refused');
});
