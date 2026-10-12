// Exercise 15.4 tests: a model of the NgModule compilation-scope rules of module 15, not Angular's compiler.
import { describe, expect, it } from "vitest";
import { type ComponentUnit, computeScopes, type Unit } from "./scope-model";

function component(
  name: string,
  extra: Partial<ComponentUnit> = {},
): ComponentUnit {
  return {
    kind: "component",
    name,
    selector: `lab-${name.toLowerCase()}`,
    standalone: false,
    ...extra,
  };
}

// A shop: SharedModule declares Badge and Hidden but exports only Badge; UiModule re-exports SharedModule.
const shop: Unit[] = [
  component("Badge"),
  component("Hidden"),
  component("Cart", { uses: ["lab-badge", "lab-row"] }),
  component("Row"),
  component("Solo", { standalone: true, imports: ["UiModule"] }),
  component("Star", { standalone: true }),
  component("Rating", { standalone: true, imports: ["Star"] }),
  {
    kind: "module",
    name: "SharedModule",
    declarations: ["Badge", "Hidden"],
    exports: ["Badge"],
  },
  {
    kind: "module",
    name: "UiModule",
    imports: ["SharedModule"],
    exports: ["SharedModule"],
  },
  {
    kind: "module",
    name: "CartModule",
    declarations: ["Cart", "Row"],
    imports: ["SharedModule"],
  },
];

describe("E15.4 a model of NgModule compilation scope", () => {
  it("a declared component sees its module's declarations and the exports of imported modules", () => {
    const { scopes, diagnostics } = computeScopes(shop);

    expect(scopes["Cart"]).toEqual(["Badge", "Cart", "Row"]);
    expect(diagnostics).toEqual([]);
  });

  it("exports are transitive through re-exported modules", () => {
    const { scopes } = computeScopes(shop);

    expect(scopes["Solo"]).toContain("Badge");
  });

  it("a declaration not exported is invisible to importers", () => {
    const user = component("User", { uses: ["lab-hidden"] });
    const { scopes, diagnostics } = computeScopes([
      ...shop,
      user,
      {
        kind: "module",
        name: "UserModule",
        declarations: ["User"],
        imports: ["SharedModule"],
      },
    ]);

    expect(scopes["User"]).not.toContain("Hidden");
    expect(diagnostics.map((d) => d.code)).toEqual(["NG8001"]);
  });

  it("a standalone component sees only itself and its own imports (and the exports of imported modules)", () => {
    const { scopes } = computeScopes(shop);

    expect(scopes["Rating"]).toEqual(["Rating", "Star"]);
    expect(scopes["Solo"]).toEqual(["Badge", "Solo"]);
  });

  it("each of the five diagnostics is reported with the class names involved", () => {
    const { diagnostics } = computeScopes([
      component("Twice"),
      component("Stray"),
      component("Old"),
      component("Badge", { standalone: true }),
      component("Page", { standalone: true, imports: ["Old"] }),
      component("Lost", { standalone: true, uses: ["lab-twice"] }),
      { kind: "module", name: "A", declarations: ["Twice"] },
      {
        kind: "module",
        name: "B",
        declarations: ["Twice", "Badge"],
        exports: ["Stray"],
      },
      {
        kind: "module",
        name: "OldModule",
        declarations: ["Old"],
        exports: ["Old"],
      },
    ]);

    expect(diagnostics.map(({ code, classes }) => ({ code, classes }))).toEqual(
      [
        { code: "NG6007", classes: ["Twice", "A", "B"] },
        { code: "NG6008", classes: ["Badge", "B"] },
        { code: "NG6004", classes: ["B", "Stray"] },
        { code: "NG2011", classes: ["Page", "Old"] },
        { code: "NG8001", classes: ["Lost", "lab-twice"] },
      ],
    );
  });

  it("a cycle of module imports terminates and is reported once", () => {
    const { scopes, diagnostics } = computeScopes([
      component("ACmp", { uses: ["lab-bcmp"] }),
      component("BCmp", { uses: ["lab-acmp"] }),
      {
        kind: "module",
        name: "AModule",
        declarations: ["ACmp"],
        imports: ["BModule"],
        exports: ["ACmp", "BModule"],
      },
      {
        kind: "module",
        name: "BModule",
        declarations: ["BCmp"],
        imports: ["AModule"],
        exports: ["BCmp", "AModule"],
      },
    ]);

    expect(scopes["ACmp"]).toEqual(["ACmp", "BCmp"]);
    expect(diagnostics).toEqual([
      {
        code: "NG6002",
        classes: ["AModule", "BModule"],
        message: "the imports of AModule -> BModule -> AModule form a cycle",
      },
    ]);
  });
});
