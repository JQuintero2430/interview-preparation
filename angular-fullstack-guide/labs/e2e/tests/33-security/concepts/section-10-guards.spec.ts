// Section 10: a route guard is UX. The admin page (`/m33/guards/admin`, security-lab nonce build) is a lazy route
// behind `canMatch`; server/security/10-guards.mjs answers the admin API from the session cookie. The chunk file is
// found by its marker in the production build under `dist`.
import { readdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { consoleErrors, distFile, newRun, SEC_ORIGIN } from '../support/security.js';

const MARKER = 'LAB_M33_ADMIN_CHUNK';
const REPORT = `${SEC_ORIGIN}/api/m33/guards/report`;

/** The file name of the production chunk that holds the admin page: the one `.js` file that contains the marker. */
async function adminChunk(): Promise<string> {
  const files = (await readdir(new URL('../../../../angular/dist/security-lab/browser/', import.meta.url))).filter((name) => name.endsWith('.js'));
  const holders: string[] = [];
  for (const name of files) {
    if ((await distFile('security-lab', `browser/${name}`)).toString('utf8').includes(MARKER)) holders.push(name);
  }
  expect(holders).toHaveLength(1);
  return holders[0] ?? '';
}

/** Opens the guards page, signs in with `role` and waits for the status. */
async function signIn(page: Page, role: 'user' | 'admin'): Promise<void> {
  await page.goto(`${SEC_ORIGIN}/m33/guards`);
  await page.getByRole('button', { name: `Sign in as ${role}` }).click();
  await expect(page.getByRole('status')).toHaveText(`Signed in as ${role}`);
}

test('Section 10: canMatch keeps a non-admin on the fallback page', async ({ context, page }) => {
  await newRun(context);
  const chunk = await adminChunk();
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  const errors = consoleErrors(page);
  await signIn(page, 'user');
  await page.getByRole('link', { name: 'Open admin' }).click();
  await expect(page.getByRole('heading', { name: 'Not available for your role' })).toBeVisible();
  await expect(page).toHaveURL(`${SEC_ORIGIN}/m33/guards/admin`);
  expect(requested.some((url) => url.endsWith(`/${chunk}`))).toBe(false);
  expect(errors).toEqual([]);
});

test('Section 10: the admin chunk is downloadable without passing the guard', async ({ context }) => {
  await newRun(context);
  const chunk = await adminChunk();
  // A plain HTTP request: no session cookie, no localStorage, no router.
  const response = await context.request.get(`${SEC_ORIGIN}/${chunk}`);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain(MARKER);
  // Even the file name is public: the page's own HTML lists it in the import map that carries the integrity hashes.
  expect(await (await context.request.get(`${SEC_ORIGIN}/m33/guards`)).text()).toContain(chunk);
});

test('Section 10: the admin API answers 403 to a non-admin and 200 to an admin', async ({ context }) => {
  await newRun(context);
  expect((await context.request.get(REPORT)).status()).toBe(401);
  await context.request.post(`${SEC_ORIGIN}/api/m33/guards/login?role=user`);
  expect((await context.request.get(REPORT)).status()).toBe(403);
  await context.request.post(`${SEC_ORIGIN}/api/m33/guards/login?role=admin`);
  const admin = await context.request.get(REPORT);
  expect(admin.status()).toBe(200);
  expect(await admin.json()).toEqual({ rows: 3 });
});

test('Section 10: a role edited in the browser opens the admin page but not the data', async ({ context, page }) => {
  await newRun(context);
  const chunk = await adminChunk();
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  const errors = consoleErrors(page);
  await signIn(page, 'user');
  expect(requested.some((url) => url.endsWith(`/${chunk}`))).toBe(false);
  await page.evaluate(() => localStorage.setItem('m33-guards-role', 'admin'));
  await page.getByRole('link', { name: 'Open admin' }).click();
  await expect(page.getByRole('heading', { name: 'Admin area' })).toBeVisible();
  expect(requested.some((url) => url.endsWith(`/${chunk}`))).toBe(true);
  await page.getByRole('button', { name: 'Load report' }).click();
  await expect(page.getByRole('status')).toHaveText('Report failed: 403');
  // The failed call is the only console error: the browser logs the 403 it received.
  expect(errors).toEqual([expect.stringContaining('403')]);
});
