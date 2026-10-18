import { satisfies } from '../range';
import { fromNpmView, type Evaluate, type PackageFacts } from './facts';
import { rank } from './rank';
import { RULES } from './rules';
import { evaluate as evaluateA } from './a/evaluate';
import { evaluate as evaluateB } from './b/evaluate';

// Exercise 37.1. The fixtures are recorded `npm view <pkg>@<version> name version peerDependencies license exports
// sideEffects 'time[<version>]' --json` output, read 2026-10-17 (command and date in `_command` and `_readAt`).
// No test here talks to the npm registry, and no test reads the clock: the evaluation date is an argument.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: unknown = await import(fsSpecifier);

function loadRecord(file: string): unknown {
  if (typeof fs !== 'object' || fs === null || !('readFileSync' in fs) || typeof fs.readFileSync !== 'function') {
    throw new Error('node:fs is not available');
  }
  const text: unknown = fs.readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
  if (typeof text !== 'string') throw new Error(`fixture ${file} is not text`);
  return JSON.parse(text);
}

const load = (file: string): PackageFacts => fromNpmView(loadRecord(file));

const TODAY = new Date('2026-10-17T00:00:00Z');

const VARIANTS: readonly (readonly [string, Evaluate])[] = [
  ['a (pure functions and a reducer)', evaluateA],
  ['b (a rule table)', evaluateB],
];

describe.each(VARIANTS)('Exercise 37.1, variant %s', (_name, evaluate) => {
  it('flags a peer range that excludes the target Angular version', () => {
    const toastr = load('ngx-toastr.json');

    expect(toastr.corePeer).toBe('^21.0.0');
    expect(evaluate(toastr, RULES, TODAY)).toEqual([
      { rule: 'peer-range', message: '@angular/core peer "^21.0.0" excludes 22.2.1' },
    ]);
    expect(evaluate(toastr, { ...RULES, angularVersion: '21.2.0' }, TODAY)).toEqual([]);
  });

  it('flags a license outside the allow-list', () => {
    const primeng = load('primeng.json');

    expect(primeng.license).toBe('SEE LICENSE IN LICENSE.md');
    expect(evaluate(primeng, RULES, TODAY)).toEqual([
      { rule: 'license', message: 'license "SEE LICENSE IN LICENSE.md" is not on the allow-list' },
    ]);
    expect(evaluate(primeng, { ...RULES, licenseAllowList: [primeng.license] }, TODAY)).toEqual([]);
  });

  it('flags a package with no publish in the 12 months before the evaluation date', () => {
    const untilDestroy = load('ngneat-until-destroy.json');

    expect(evaluate(untilDestroy, RULES, TODAY)).toEqual([
      { rule: 'last-publish', message: '10.0.0 was published 2023-08-03, more than 12 months before 2026-10-17' },
    ]);
    // The date is a parameter: the same record is fresh on an earlier date and stale on a later one.
    expect(evaluate(untilDestroy, RULES, new Date('2024-06-01T00:00:00Z'))).toEqual([]);
    const zorro = load('ng-zorro-antd.json');
    expect(evaluate(zorro, RULES, TODAY)).toEqual([]);
    expect(evaluate(zorro, RULES, new Date('2027-10-09T00:00:00Z'))).toEqual([]);
    expect(evaluate(zorro, RULES, new Date('2027-10-11T00:00:00Z')).map((finding) => finding.rule)).toEqual([
      'last-publish',
    ]);
  });

  it('reports whether the package declares exports and sideEffects', () => {
    const zorroRecord = loadRecord('ng-zorro-antd.json');
    if (typeof zorroRecord !== 'object' || zorroRecord === null) throw new Error('fixture is not an object');
    const bare = Object.fromEntries(
      Object.entries(zorroRecord).filter(([key]) => key !== 'exports' && key !== 'sideEffects'),
    );

    const declared = fromNpmView(zorroRecord);
    const missing = fromNpmView(bare);
    const ranking = rank([declared, missing], RULES, TODAY, evaluate);

    expect([declared.hasExports, declared.hasSideEffects]).toEqual([true, true]);
    expect([missing.hasExports, missing.hasSideEffects]).toEqual([false, false]);
    expect(ranking.accepted.map(({ hasExports, hasSideEffects }) => [hasExports, hasSideEffects])).toEqual([
      [true, true],
      [false, false],
    ]);
  });

  it('ranks the accepted candidates and gives a reason for each rejection', () => {
    const candidates = [
      'ngx-toastr.json',
      'ngneat-until-destroy.json',
      'primeng.json',
      'ng-zorro-antd.json',
      'spartan-brain.json',
      'swimlane-ngx-charts.json',
    ].map(load);

    expect(rank(candidates, RULES, TODAY, evaluate)).toEqual({
      accepted: [
        { name: '@spartan-ng/brain', version: '1.8.0', hasExports: true, hasSideEffects: true },
        { name: 'ng-zorro-antd', version: '22.1.2', hasExports: true, hasSideEffects: true },
        { name: '@swimlane/ngx-charts', version: '25.0.3', hasExports: true, hasSideEffects: true },
      ],
      rejected: [
        { name: 'ngx-toastr', reasons: ['@angular/core peer "^21.0.0" excludes 22.2.1'] },
        {
          name: '@ngneat/until-destroy',
          reasons: ['10.0.0 was published 2023-08-03, more than 12 months before 2026-10-17'],
        },
        { name: 'primeng', reasons: ['license "SEE LICENSE IN LICENSE.md" is not on the allow-list'] },
      ],
    });
  });
});

describe('Exercise 37.1: the two variants agree', () => {
  it('give the same findings for every fixture on two dates', () => {
    const files = ['ngx-toastr', 'ngneat-until-destroy', 'primeng', 'ng-zorro-antd', 'spartan-brain', 'swimlane-ngx-charts'];
    for (const date of [TODAY, new Date('2028-01-01T00:00:00Z')]) {
      for (const file of files) {
        const pkg = load(`${file}.json`);
        expect(evaluateA(pkg, RULES, date)).toEqual(evaluateB(pkg, RULES, date));
      }
    }
  });
});

describe('Exercise 37.1: the peer-range matcher (range.ts, shared with the section 12 tests)', () => {
  it.each([
    ['22.2.1', '^21.0.0', false],
    ['22.2.1', '^21.2.0 || ^22.0.0', true],
    ['22.2.1', '>=21.0.0 <23.0.0', true],
    ['23.0.0', '>=21.0.0 <23.0.0', false],
    ['22.2.1', '>=13', true],
    ['22.2.1', '<=22.2.0', false],
    ['22.2.1', '>= 14.x <= 22.x', true],
  ])('%s against "%s" is %s', (version, range, expected) => {
    expect(satisfies(version, range)).toBe(expected);
  });
});
