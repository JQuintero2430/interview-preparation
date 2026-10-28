// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flagsFor, moduleStats, proseWords, syllabusRows } from './module-stats.mjs';

test('syllabusRows reads Part letters beyond G, core (pilot), lab dash and the prose cap from section 1 only', () => {
  const md = '## 1. Module list\n| # | Slug | Part | Kind | Q | Ex | Prose cap | Lab | Prerequisites |\n|---|---|---|---|---|---|---|---|---|\n'
    + '| 01 | `java-oop-fundamentals` | A · Java language | core | 30 | 4 | 18000 | java-language | none |\n'
    + '| 17 | `spring-transactions` | F | core (pilot) | 40 | 6 | 18,000 | persistence | 01 |\n'
    + '| 53 | `design-interview` | N | supporting | 14 | 3 | 9000 | — | 01 |\n'
    + '## 2. Map\n| 99 | `x` | A | core | 1 | 1 | 1 | — | |\n';
  assert.deepEqual(syllabusRows(md), [
    { num: '01', slug: 'java-oop-fundamentals', part: 'A', kind: 'core', qMax: 30, exMax: 4, proseCap: 18000, lab: 'java-language' },
    { num: '17', slug: 'spring-transactions', part: 'F', kind: 'core', qMax: 40, exMax: 6, proseCap: 18000, lab: 'persistence' },
    { num: '53', slug: 'design-interview', part: 'N', kind: 'supporting', qMax: 14, exMax: 3, proseCap: 9000, lab: null },
  ]);
});

test('proseWords ignores fenced code; moduleStats counts questions, exercises, Production scenario and tags', () => {
  assert.equal(proseWords('one two\n```java\nint a = 1;\n```\nthree'), 3);
  const md = '<a id="q01-01"></a>\n### Q01.01 · Output · What?\n### Q01.01a · Production scenario · Bug hunt · Why?\n'
    + '### Exercise 01.1 · X\n```md\n### Q01.99 · Concept · fenced\n```\n';
  const s = moduleStats(md);
  assert.deepEqual(s.mix, { Output: 1, 'Production scenario': 1, 'Bug hunt': 1 });
  assert.equal(s.questions, 2);
  assert.equal(s.exercises, 1);
  assert.equal(s.production, 1);
});

test('flagsFor applies core and supporting floors, ceilings and the row prose cap', () => {
  const core = { kind: 'core', qMax: 2, exMax: 3, proseCap: 100 };
  assert.deepEqual(flagsFor({ questions: 3, exercises: 1, production: 0, prose: 101, mix: {} }, core), [
    'questions 3 < floor 20',
    'exercises 1 < floor 3',
    'Production scenario 0 < floor 3',
    'questions 3 > ceiling 2',
    'prose 101 > cap 100',
  ]);
  const supporting = { kind: 'supporting', qMax: 14, exMax: 3, proseCap: 9000 };
  assert.deepEqual(flagsFor({ questions: 12, exercises: 2, production: 1, prose: 9000, mix: {} }, supporting), []);
  assert.deepEqual(flagsFor({ questions: 11, exercises: 2, production: 1, prose: 1, mix: {} }, supporting), ['questions 11 < floor 12']);
});
