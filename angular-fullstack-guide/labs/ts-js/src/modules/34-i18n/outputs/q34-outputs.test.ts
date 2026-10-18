// Output questions of module 34 that run under Vitest on Node 24 (ICU 78.3, CLDR 48.0); a browser can differ.
type Category = Intl.LDMLPluralRule;

function categories(
  locale: string,
  values: number[],
  type: Intl.PluralRulesOptions["type"] = "cardinal",
): Category[] {
  const rules = new Intl.PluralRules(locale, { type });
  return values.map((value) => rules.select(value));
}

describe("Q34.04: Intl.PluralRules", () => {
  it("Q34.04 each language maps 0, 1, 2, 5, 11 and 1.5 to its own categories, and English ordinals use one, two, few and other", () => {
    const values = [0, 1, 2, 5, 11, 1.5];

    expect(categories("en", values)).toEqual([
      "other",
      "one",
      "other",
      "other",
      "other",
      "other",
    ]);
    expect(categories("fr", values)).toEqual([
      "one",
      "one",
      "other",
      "other",
      "other",
      "one",
    ]);
    expect(categories("ar", values)).toEqual([
      "zero",
      "one",
      "two",
      "few",
      "many",
      "other",
    ]);
    expect(categories("ru", values)).toEqual([
      "many",
      "one",
      "few",
      "many",
      "many",
      "other",
    ]);
    expect(categories("en", [1, 2, 3, 11], "ordinal")).toEqual([
      "one",
      "two",
      "few",
      "other",
    ]);
  });
});
