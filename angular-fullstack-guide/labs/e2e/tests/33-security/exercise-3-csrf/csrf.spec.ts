// Exercise 33.3: stop cross-site requests against a cookie session, in Chromium. server/security/ex3-csrf-a.mjs
// (solution: a SameSite=Lax session cookie plus the cookie-to-header token) answers under /api/m33/ex3/a/ and
// ex3-csrf-b.mjs (alternative: a SameSite=Strict cookie plus Sec-Fetch-Site and Origin checks) under /b/. The app's
// page is /m33/ex3/<variant>; "another site" is the same server reached as 127.0.0.1 (attacker pages under
// /m33/ex3/<variant>/attacker/). Both variants run the same five criteria.
import { expect, test, type Page } from '@playwright/test';
import { ATTACKER_ORIGIN, consoleErrors, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

interface Transfer {
  transfer: true;
  method: string;
  cookies: string[];
  secFetchSite: string | null;
  origin: string | null;
  header: boolean;
  status: number;
}

interface Variant {
  name: string;
  id: 'a' | 'b';
  session: string;
  cookies: string[];
  /** Requests that carry the session cookie but fail the variant's own check. */
  refused: Record<string, string>[];
}

const variants: Variant[] = [
  {
    name: 'solution: a Lax cookie and a cookie-to-header token',
    id: 'a',
    session: 'm33-ex3a',
    cookies: ['XSRF-TOKEN', 'm33-ex3a'],
    refused: [{}, { 'X-XSRF-TOKEN': 'forged' }],
  },
  {
    name: 'alternative: a Strict cookie and Sec-Fetch-Site and Origin checks',
    id: 'b',
    session: 'm33-ex3b',
    cookies: ['m33-ex3b'],
    refused: [
      { 'Sec-Fetch-Site': 'cross-site', Origin: SEC_ORIGIN },
      { 'Sec-Fetch-Site': 'same-origin', Origin: ATTACKER_ORIGIN },
    ],
  },
];

/** Signs in on the variant's page, so localhost holds its session cookie. */
async function signIn(page: Page, id: string): Promise<void> {
  await page.goto(`${SEC_ORIGIN}/m33/ex3/${id}`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in');
}

/** Waits until the server has logged `count` transfer requests for the run, then returns them. */
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

/** How many transfers the server applied in the run. */
async function applied(page: Page, id: string): Promise<number> {
  const response = await page.context().request.get(`${SEC_ORIGIN}/api/m33/ex3/${id}/account`);
  const { transfers: count }: { transfers: number } = await response.json();
  return count;
}

/** The value of a cookie the browser holds for the lab's site. */
async function cookie(page: Page, name: string): Promise<string | undefined> {
  return (await page.context().cookies(SEC_ORIGIN)).find((candidate) => candidate.name === name)?.value;
}

for (const variant of variants) {
  test.describe(variant.name, () => {
    const api = `${SEC_ORIGIN}/api/m33/ex3/${variant.id}`;

    test('Second layer: a request that carries the session cookie but fails the check is refused', async ({ context, page }) => {
      await newRun(context);
      await signIn(page, variant.id);
      const held = (await context.cookies(SEC_ORIGIN)).map(({ name }) => name).filter((name) => name !== 'm33-run');
      expect(held.sort()).toEqual(variant.cookies);

      for (const headers of variant.refused) {
        const response = await context.request.post(`${api}/transfer`, { headers, data: { amount: 10 } });
        expect(response.status()).toBe(403);
      }

      expect(await applied(page, variant.id)).toBe(0);
    });

    test('accepts a transfer submitted by the app', async ({ context, page }) => {
      const run = await newRun(context);
      const errors = consoleErrors(page);
      await signIn(page, variant.id);

      await page.getByRole('button', { name: 'Transfer 10' }).click();

      await expect(page.getByRole('status')).toHaveText('Transfer accepted');
      const [own] = await transfers(page, run, 1);
      expect(own).toMatchObject({ method: 'POST', secFetchSite: 'same-origin', origin: SEC_ORIGIN, status: 200 });
      expect(own?.header).toBe(variant.id === 'a');
      expect(await applied(page, variant.id)).toBe(1);
      expect(errors).toEqual([]);
    });

    test('rejects a transfer auto-submitted from another site', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      await page.goto(`${ATTACKER_ORIGIN}/m33/ex3/${variant.id}/attacker/form`);

      const [forged] = await transfers(page, run, 1);
      expect(forged).toMatchObject({ method: 'POST', secFetchSite: 'cross-site', origin: ATTACKER_ORIGIN, status: 401 });
      expect(forged?.cookies).not.toContain(variant.session);
      expect(await applied(page, variant.id)).toBe(0);
    });

    test('rejects a cross-site fetch with credentials', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      await page.goto(`${ATTACKER_ORIGIN}/m33/ex3/${variant.id}/attacker/fetch`);

      const [forged] = await transfers(page, run, 1);
      expect(forged).toMatchObject({ method: 'POST', secFetchSite: 'cross-site', origin: ATTACKER_ORIGIN, status: 401 });
      expect(forged?.cookies).not.toContain(variant.session);
      expect(await applied(page, variant.id)).toBe(0);
    });

    test('changes nothing on a GET to the transfer endpoint', async ({ context, page }) => {
      const run = await newRun(context);
      await signIn(page, variant.id);

      const response = await page.goto(`${api}/transfer`);

      expect(response?.status()).toBe(405);
      const [seen] = await transfers(page, run, 1);
      expect(seen).toMatchObject({ method: 'GET', status: 405 });
      expect(seen?.cookies).toContain(variant.session);
      expect(await applied(page, variant.id)).toBe(0);
    });

    test("accepts the app's transfer after a new login", async ({ context, page }) => {
      await newRun(context);
      await signIn(page, variant.id);
      const before = { session: await cookie(page, variant.session), token: await cookie(page, 'XSRF-TOKEN') };

      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect.poll(() => cookie(page, variant.session)).not.toBe(before.session);
      await page.getByRole('button', { name: 'Transfer 10' }).click();

      await expect(page.getByRole('status')).toHaveText('Transfer accepted');
      expect(await applied(page, variant.id)).toBe(1);
      if (variant.id === 'a') expect(await cookie(page, 'XSRF-TOKEN')).not.toBe(before.token);
    });
  });
}
