// Exercise 39.2: five criteria, each run over both planners (our code: the compatibility rows are copied from angular.dev,
// read 2026-10-19; the refusal models `@angular/cli` 22.2.1 `cli.js`, read, not run). No clock, network, git, npm or ng.
import type { Planner } from './hops';
import { planner as planA } from './a/plan';
import { planner as planB } from './b/plan';

interface Expected {
  readonly typescript17: string;
  readonly typescript20: string;
  readonly angular20: string;
}

const CORE = '@angular/core';

describe.each<[string, Planner, Expected]>([
  ['a (the first row of each major)', planA, { typescript17: '>=5.2.0 <5.3.0', typescript20: '>=5.8.0 <5.9.0', angular20: '20.0.x || 20.1.x' }],
  ['b (the last row of each major)', planB, { typescript17: '>=5.2.0 <5.5.0', typescript20: '>=5.8.0 <6.0.0', angular20: '20.2.x || 20.3.x' }],
])('Exercise 39.2 · upgrade planner %s', (_variant, planner, expected) => {
  it('refuses a direct jump of more than one major with the CLI wording', () => {
    expect(planner.refuse(CORE, 13, 22)).toBe(
      "Updating multiple major versions of '@angular/core' at once is not supported. Please migrate each major version individually.\n" +
        "Run 'ng update @angular/core@14' in your workspace directory to update to latest '14.x' version of '@angular/core'.\n\n" +
        'For more information about the update process, see https://update.angular.dev/?v=13.0-14.0',
    );
    expect(planner.refuse(CORE, 13, 15)).toContain("ng update @angular/core@14'");
    expect(planner.refuse(CORE, 13, 14)).toBeUndefined();
  });

  it('plans one hop per major from the start version to the target', () => {
    const hops = planner.plan(13, 22, '24.15.0');
    expect(hops.map((hop) => hop.to)).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22]);
    expect(hops.every((hop) => hop.to - hop.from === 1)).toBe(true);
    expect(hops.every((hop) => planner.refuse(CORE, hop.from, hop.to) === undefined)).toBe(true);
    expect(planner.plan(9, 12, '12.11.0').map((hop) => hop.to)).toEqual([10, 11, 12]);
    expect(planner.plan(22, 22, '24.15.0')).toEqual([]);
  });

  it('reports the hops where the current Node version is outside the target row', () => {
    const misfits = (from: number, to: number, node: string): number[] =>
      planner.plan(from, to, node).filter((hop) => !hop.nodeFits).map((hop) => hop.to);
    // Node 18.19.1 is newer than the 14.0.x row allows, fits 15 to 19, and is older than the 20.0.x row allows.
    expect(misfits(13, 22, '18.19.1')).toEqual([14, 20, 21, 22]);
    // Node 22.12.0 fits the 21 row (^22.12.0) but not the 22 row (^22.22.3).
    expect(misfits(20, 22, '22.12.0')).toEqual([22]);
    expect(misfits(20, 22, '22.22.3')).toEqual([]);
  });

  it('reports the TypeScript range each hop requires', () => {
    const hops = planner.plan(13, 22, '24.15.0');
    const at = (major: number) => hops.find((hop) => hop.to === major);
    expect(at(17)?.typescript).toBe(expected.typescript17);
    expect(at(20)?.typescript).toBe(expected.typescript20);
    expect(at(20)?.angular).toBe(expected.angular20);
    expect(at(22)?.typescript).toBe('>=6.0.0 <6.1.0');
  });

  it('rejects a downgrade', () => {
    expect(() => planner.plan(15, 13, '18.19.1')).toThrow('our planner does not plan a downgrade: 15 to 13');
    // The CLI's own check compares only "more than one major up", so a downgrade passes it; refusing is our rule.
    expect(planner.refuse(CORE, 15, 13)).toBeUndefined();
  });
});
