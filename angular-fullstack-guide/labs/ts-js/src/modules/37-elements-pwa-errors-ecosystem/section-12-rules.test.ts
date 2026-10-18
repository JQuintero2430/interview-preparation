import { satisfies } from './range';
import { evaluate, fromNpmView, type Rules } from './rules-table';

// Section 12 claims: an evaluation rule table applied to registry metadata flags a peer range that excludes the
// target Angular version and a package with no publish in the last 12 months, and passes one within the rules.
// The fixtures are recorded `npm view <pkg>@<version> name version peerDependencies license 'time[<version>]'
// time.modified --json` output, read 2026-10-17 (command and date in `_command` and `_readAt`). No test here
// talks to the npm registry.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: unknown = await import(fsSpecifier);

function loadFixture(file: string): unknown {
  if (typeof fs !== 'object' || fs === null || !('readFileSync' in fs) || typeof fs.readFileSync !== 'function') {
    throw new Error('node:fs is not available');
  }
  const text: unknown = fs.readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
  if (typeof text !== 'string') throw new Error(`fixture ${file} is not text`);
  return JSON.parse(text);
}

const RULES: Rules = {
  angularVersion: '22.2.1',
  licenseAllowList: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'],
  maxMonthsSincePublish: 12,
};

describe('Section 12: the evaluation rule table on recorded registry metadata', () => {
  it('Section 12: the rule table flags a peer range that excludes Angular 22.2.1', () => {
    const toastr = fromNpmView(loadFixture('ngx-toastr.json'));

    expect(toastr.corePeer).toBe('^21.0.0');
    expect(evaluate(toastr, RULES)).toEqual([
      { rule: 'peer-range', message: '@angular/core peer "^21.0.0" excludes 22.2.1' },
    ]);
    // The matcher on the range shapes this module's packages use.
    expect(satisfies('22.2.1', '^21.0.0')).toBe(false);
    expect(satisfies('22.2.1', '^21.2.0 || ^22.0.0')).toBe(true);
    expect(satisfies('22.2.1', '>= 14.x <= 22.x')).toBe(true);
    expect(satisfies('22.2.3', '22.2.1')).toBe(false);
  });

  it('Section 12: the rule table flags a package with no publish in the last 12 months', () => {
    const untilDestroy = fromNpmView(loadFixture('ngneat-until-destroy.json'));

    expect(untilDestroy.corePeer).toBe('>=13');
    expect(evaluate(untilDestroy, RULES)).toEqual([
      {
        rule: 'last-publish',
        message: '10.0.0 was published 2023-08-03, more than 12 months before 2026-10-17',
      },
    ]);
  });

  it('Section 12: the rule table passes a package whose peer, license and date are within the rules', () => {
    const zorro = fromNpmView(loadFixture('ng-zorro-antd.json'));

    expect(zorro.corePeer).toBe('^22.0.0');
    expect(zorro.license).toBe('MIT');
    expect(zorro.publishedAt.toISOString()).toBe('2026-10-10T09:49:32.364Z');
    expect(evaluate(zorro, RULES)).toEqual([]);
  });
});
