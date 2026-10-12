// Exercise 12.3 tests: results of a model of @angular/build 22.2.1 `src/utils/bundle-calculator.js`, not of `ng build`.
// The last test applies the lab's own production budgets (labs/angular/angular.json, read-only) to the output section 3 observed.
import { describe, expect, it } from 'vitest';
import { checkBudgets, type Budget, type OutputFile } from './budgets';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
};

interface Workspace {
  readonly projects: Readonly<
    Record<
      string,
      {
        readonly architect: {
          readonly build: {
            readonly configurations: {
              readonly production: { readonly budgets: Budget[] };
            };
          };
        };
      }
    >
  >;
}

const workspace = JSON.parse(readFileSync(new URL('../../../../angular/angular.json', import.meta.url), 'utf8')) as Workspace;

describe('E12.3 · a bundle-budget checker (a model of the calculator)', () => {
  it('500kb means 500,000 bytes and is compared with the sum of initial files', () => {
    const budgets: Budget[] = [{ type: 'initial', maximumError: '500kb' }];
    const atLimit: OutputFile[] = [
      { name: 'main.js', size: 300_000, initial: true },
      { name: 'styles.css', size: 200_000, initial: true },
      { name: 'chunk-lazy.js', size: 400_000, initial: false },
    ];
    const overByOne: OutputFile[] = [...atLimit, { name: 'polyfills.js', size: 1, initial: true }];

    expect(checkBudgets(budgets, atLimit)).toEqual([]);
    expect(checkBudgets(budgets, overByOne)).toEqual([
      {
        severity: 'error',
        label: 'bundle initial',
        message:
          'bundle initial exceeded maximum budget. Budget 500000 bytes was not met by 1 bytes with a total of 500001 bytes.',
      },
    ]);
    expect(checkBudgets([{ type: 'initial', maximumError: '0.5 MB' }], atLimit)).toEqual([]);
    expect(() => checkBudgets([{ type: 'initial', maximumError: 'half a meg' }], atLimit)).toThrow(
      'Unreadable budget size: "half a meg"',
    );
  });

  it('maximumWarning and maximumError each produce a result only when exceeded, warning and error independently', () => {
    const budgets: Budget[] = [{ type: 'allScript', maximumWarning: '1kb', maximumError: '2kb' }];
    const severities = (size: number): string[] =>
      checkBudgets(budgets, [{ name: 'main.js', size }]).map((result) => result.severity);

    expect(severities(1_000)).toEqual([]);
    expect(severities(1_500)).toEqual(['warning']);
    expect(severities(2_500)).toEqual(['warning', 'error']);
  });

  it('anyComponentStyle checks each component stylesheet on its own', () => {
    const files: OutputFile[] = [
      { name: 'src/app/card.css', size: 3_000, componentStyle: true },
      { name: 'src/app/table.css', size: 5_000, componentStyle: true },
      { name: 'styles.css', size: 9_000, initial: true },
    ];

    const results = checkBudgets([{ type: 'anyComponentStyle', maximumWarning: '4kB' }], files);

    expect(results.map(({ severity, label }) => ({ severity, label }))).toEqual([
      { severity: 'warning', label: 'src/app/table.css' },
    ]);
  });

  it('bundle budgets match by chunk name', () => {
    // The sizes of section 3's throwaway build: a 287-byte chunk named `lazy` against `maximumError: "200b"`.
    const files: OutputFile[] = [
      { name: 'chunk-ABC.js', size: 287, chunkName: 'lazy' },
      { name: 'chunk-DEF.js', size: 900, chunkName: 'admin' },
    ];

    expect(checkBudgets([{ type: 'bundle', name: 'lazy', maximumError: '200b' }], files)).toEqual([
      {
        severity: 'error',
        label: 'lazy',
        message: 'lazy exceeded maximum budget. Budget 200 bytes was not met by 87 bytes with a total of 287 bytes.',
      },
    ]);
  });

  it('a baseline with % thresholds checks both a maximum and a minimum around it', () => {
    const budgets: Budget[] = [{ type: 'allScript', baseline: '300kB', warning: '10%' }];
    const messages = (size: number): string[] =>
      checkBudgets(budgets, [{ name: 'main.js', size }]).map((result) => result.message);

    expect(messages(270_000)).toEqual([]);
    expect(messages(330_000)).toEqual([]);
    expect(messages(269_999)).toEqual([
      'total scripts failed to meet minimum budget. Budget 270000 bytes was not met by 1 bytes with a total of 269999 bytes.',
    ]);
    expect(messages(330_001)).toEqual([
      'total scripts exceeded maximum budget. Budget 330000 bytes was not met by 1 bytes with a total of 330001 bytes.',
    ]);
    // Without a baseline a percentage is a percentage of 0 bytes, so this budget fails on any non-empty build.
    expect(checkBudgets([{ type: 'allScript', maximumWarning: '10%' }], [{ name: 'main.js', size: 1 }])).toHaveLength(1);
  });

  it('results are ordered as the budgets are declared, and an empty list means the build passes', () => {
    const files: OutputFile[] = [{ name: 'main.js', size: 10_000, initial: true }];
    const budgets: Budget[] = [
      { type: 'anyScript', maximumWarning: '5kb' },
      { type: 'initial', maximumError: '8kb' },
      { type: 'all', minimumWarning: '20kb' },
    ];

    expect(checkBudgets(budgets, files).map((result) => result.label)).toEqual(['main.js', 'bundle initial', 'total']);
    expect(checkBudgets(budgets.slice(0, 2), [{ name: 'main.js', size: 1_000, initial: true }])).toEqual([]);
  });

  it("(model check) the lab's own production budgets applied to the observed main-*.js size produce no result", () => {
    const budgets = workspace.projects['labs']?.architect.build.configurations.production.budgets ?? [];
    // Observed in the lab's production build on 2026-10-07 (section 3): main-626TZXGR.js 189,560 bytes, styles-5INURTSO.css 0 bytes.
    const observed: OutputFile[] = [
      { name: 'main-626TZXGR.js', size: 189_560, initial: true },
      { name: 'styles-5INURTSO.css', size: 0, initial: true },
    ];

    expect(budgets.map((budget) => budget.type)).toEqual(['initial', 'anyComponentStyle']);
    expect(checkBudgets(budgets, observed)).toEqual([]);
    // Section 3's throwaway copy lowered initial maximumError to 150kB: "Budget 150.00 kB was not met by 39.56 kB with a total of 189.56 kB."
    expect(checkBudgets([{ type: 'initial', maximumError: '150kB' }], observed)[0]?.message).toBe(
      'bundle initial exceeded maximum budget. Budget 150000 bytes was not met by 39560 bytes with a total of 189560 bytes.',
    );
  });
});
