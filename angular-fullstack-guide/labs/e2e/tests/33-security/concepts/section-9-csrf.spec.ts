// Section 9: CSRF against a cookie session. The bank page (`/m33/csrf/bank`, security-lab nonce build) signs in with
// four HttpOnly cookies and posts a transfer through HttpClient; server/security/09-csrf.mjs logs what each transfer
// carried. "The attacker" is a page served on 127.0.0.1 (another site than localhost) that forges the same POST.
import { expect, test, type Page } from '@playwright/test';
import { ATTACKER_ORIGIN, consoleErrors, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

interface Transfer {
  transfer: true;
  cookies: string[];
  secFetchSite: string | null;
  origin: string | null;
  header: boolean;
  status: number;
}

/** Signs in on the bank page, so localhost holds the session cookies. */
async function signIn(page: Page): Promise<void> {
  await page.goto(`${SEC_ORIGIN}/m33/csrf/bank`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in');
}

/** Waits until the server has logged `count` transfers for the run, then returns them. */
async function transfers(page: Page, run: string, count: number): Promise<Transfer[]> {
  let seen: Transfer[] = [];
  await expect
    .poll(async () => {
      const { requests } = await serverLog(page.context().request, run);
      seen = requests.filter((entry): entry is Transfer => typeof entry === 'object' && entry !== null && 'transfer' in entry);
      return seen.length;
    })
    .toBe(count);
  return seen;
}

test('Section 9: a cross-site form post carries only the None cookie and the cookie without SameSite', async ({ context, page }) => {
  const run = await newRun(context);
  await signIn(page);
  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/form`);
  const [forged] = await transfers(page, run, 1);
  expect(forged?.cookies).toEqual(['def', 'none']);
});

test('Section 9: a cross-site no-cors fetch carries only the None cookie', async ({ context, page }) => {
  const run = await newRun(context);
  await signIn(page);
  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/fetch`);
  const [forged] = await transfers(page, run, 1);
  expect(forged?.cookies).toEqual(['none']);
});

test('Section 9: the forged request arrives with Sec-Fetch-Site cross-site', async ({ context, page }) => {
  const run = await newRun(context);
  await signIn(page);
  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/form`);
  await transfers(page, run, 1);
  await page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/fetch`);
  const forged = await transfers(page, run, 2);
  expect(forged.map(({ secFetchSite, origin }) => ({ secFetchSite, origin }))).toEqual([
    { secFetchSite: 'cross-site', origin: ATTACKER_ORIGIN },
    { secFetchSite: 'cross-site', origin: ATTACKER_ORIGIN },
  ]);
});

test("Section 9: the app's own post carries the XSRF header and is accepted", async ({ context, page }) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Transfer 10' }).click();
  await expect(page.getByRole('status')).toHaveText('Transfer accepted');
  const [own] = await transfers(page, run, 1);
  expect(own).toEqual({
    transfer: true,
    cookies: ['XSRF-TOKEN', 'def', 'lax', 'none', 'strict'],
    secFetchSite: 'same-origin',
    origin: SEC_ORIGIN,
    header: true,
    status: 200,
  });
  expect(errors).toEqual([]);
});

test('Section 9: the forged post without the header is rejected', async ({ context, page }) => {
  const run = await newRun(context);
  await signIn(page);
  const [response] = await Promise.all([
    page.waitForResponse((candidate) => candidate.url().includes('/api/m33/csrf/transfer')),
    page.goto(`${ATTACKER_ORIGIN}/m33/csrf/attacker/form`),
  ]);
  expect(response.status()).toBe(403);
  const [forged] = await transfers(page, run, 1);
  // The session cookies arrived; only the missing header decided.
  expect(forged).toMatchObject({ cookies: ['def', 'none'], header: false, status: 403 });
});

test('Section 9: HttpClient strips the XSSI prefix before parsing JSON', async ({ page, request }) => {
  const errors = consoleErrors(page);
  const raw = await request.get(`${SEC_ORIGIN}/api/m33/csrf/xssi`);
  const text = await raw.text();
  expect(text).toBe(")]}',\n" + '{"ok":true}');
  expect(() => JSON.parse(text)).toThrow();
  await page.goto(`${SEC_ORIGIN}/m33/csrf/bank`);
  await page.getByRole('button', { name: 'Load status' }).click();
  await expect(page.getByRole('status')).toHaveText('Status ok: true');
  expect(errors).toEqual([]);
});
