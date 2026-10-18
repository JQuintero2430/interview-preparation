import { readUnits } from "./support/xliff";

// Exercise 34.2: every message of the checkout pages has a custom ID `m34.ex2.<variant>.<name>`, and a French and
// an Arabic translation under that ID. The pages are read as text; the files are the committed output of
// `npx ng extract-i18n i18n-lab --output-path projects/i18n-lab/src/locale` plus the two translations. Node 24.
const fsSpecifier = "node:fs";
const { readFileSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: "utf8") => string;
};

const LAB = new URL("../../../../angular/projects/i18n-lab/", import.meta.url);
const PAGES = {
  a: "src/app/m34/exercise-2-checkout/a/checkout-a.ts",
  b: "src/app/m34/exercise-2-checkout/b/checkout-b.ts",
} as const;

const unitsOf = (file: string) =>
  new Map(
    readUnits(new URL(`src/locale/${file}`, LAB)).map((unit) => [
      unit.id,
      unit,
    ]),
  );
const extracted = unitsOf("messages.xlf");
const french = unitsOf("messages.fr.xlf");
const arabic = unitsOf("messages.ar.xlf");

/** The IDs written with `@@id` and how many messages the page marks in all (template attributes and `$localize`). */
function messagesOf(variant: keyof typeof PAGES): {
  marked: number;
  ids: string[];
} {
  const text = readFileSync(new URL(PAGES[variant], LAB), "utf8");
  const marked =
    (text.match(/\bi18n="/g) ?? []).length +
    (text.match(/\$localize`/g) ?? []).length;
  const ids = [...text.matchAll(/(?:i18n="|\$localize`):?@@([\w.]+)/g)].flatMap(
    (match) => match[1] ?? [],
  );
  return { marked, ids };
}

describe.each(["a", "b"] as const)(
  "E34 exercise 34.2 variant %s (labs/angular/projects/i18n-lab/src/locale)",
  (variant) => {
    it("gives every message a custom ID with a French and an Arabic translation", () => {
      const { marked, ids } = messagesOf(variant);
      expect(marked, "the page marks messages").toBeGreaterThan(0);
      expect(ids, "every marked message carries @@id").toHaveLength(marked);
      for (const id of ids) {
        expect(id, "custom ID shape").toMatch(
          new RegExp(`^m34\\.ex2\\.${variant}\\.[a-z]+$`),
        );
        expect(extracted.has(id), `${id} is extracted`).toBe(true);
        expect(french.get(id)?.target, `fr: ${id}`).toBeTruthy();
        expect(arabic.get(id)?.target, `ar: ${id}`).toBeTruthy();
      }
    });
  },
);
