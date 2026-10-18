import { expect, test, type Browser, type Page } from "@playwright/test";
import { localeUrl, type I18nLocale } from "../support/i18n.js";

// Exercise 34.2: the checkout summary of the `i18n-lab` locale builds, in both variants.
// `a` writes one ICU plural in the template; `b` picks one `$localize` message per plural category in code.
const VARIANTS = ["a", "b"] as const;

async function open(
  browser: Browser,
  locale: I18nLocale,
  variant: string,
): Promise<Page> {
  const context = await browser.newContext({ locale, timezoneId: "UTC" });
  const page = await context.newPage();
  await page.goto(localeUrl(locale, `m34/ex2/${variant}`));
  await expect(page.getByTestId("summary")).toBeVisible();
  return page;
}

/** Presses a count button and expects the summary text it produces. */
async function expectSummary(
  page: Page,
  count: string,
  expected: string,
): Promise<void> {
  await page.getByRole("button", { name: count, exact: true }).click();
  await expect(
    page.getByTestId("summary"),
    `after pressing ${count}`,
  ).toHaveText(expected);
}

for (const variant of VARIANTS) {
  test.describe(`variant ${variant}`, () => {
    test("shows the English summary in the en-US build", async ({
      browser,
    }) => {
      const page = await open(browser, "en-US", variant);
      await expect(page.getByRole("heading", { level: 2 })).toHaveText(
        "Order summary",
      );
      await expectSummary(page, "1", "1 item");
      await expectSummary(page, "3", "3 items");
      await expectSummary(page, "0", "0 items");
    });

    test("uses the French one form for zero and one item", async ({
      browser,
    }) => {
      const page = await open(browser, "fr", variant);
      await expectSummary(page, "0", "0 article");
      await expectSummary(page, "1", "1 article");
      await expectSummary(page, "2", "2 articles");
    });

    test("uses the Arabic few form for three items", async ({ browser }) => {
      const page = await open(browser, "ar", variant);
      await expectSummary(page, "3", "3 عناصر");
      await expectSummary(page, "2", "عنصران");
      await expectSummary(page, "11", "11 عنصرًا");
    });

    test("formats the total in each locale's currency format", async ({
      browser,
    }) => {
      // Three items at 12.50 EUR. The explicit `EUR` code keeps the currency; the build's locale decides the rest.
      const totals = {
        "en-US": "€37.50",
        fr: "37,50\u00a0€",
        ar: "\u200f37.50\u00a0€",
      } as const;
      for (const locale of ["en-US", "fr", "ar"] as const) {
        const page = await open(browser, locale, variant);
        await expect
          .poll(() => page.getByTestId("total").textContent(), {
            message: locale,
          })
          .toBe(totals[locale]);
      }
    });
  });
}
