// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capExceptions, capNote, flagsFor, moduleStats, proseWords, syllabusRows } from './module-stats.mjs';

test('syllabusRows reads number, slug, part, kind and ceilings from section 1 only', () => {
  const md = '## 1. List\n| # | Slug | Part | Kind | Q | Ex | Prerequisites |\n|---|---|---|---|---|---|---|\n'
    + '| 01 | `js-values` | A · JavaScript | — | 22 | 3 | none |\n| 17 | `signals` *(pilot)* | D | **NG** | 40 | 6 | 13 |\n## 2. Map\n| 99 | `x` | A | — | 1 | 1 | |\n';
  assert.deepEqual(syllabusRows(md), [
    { num: '01', slug: 'js-values', part: 'A', ng: false, qMax: 22, exMax: 3 },
    { num: '17', slug: 'signals', part: 'D', ng: true, qMax: 40, exMax: 6 },
  ]);
});

test('proseWords ignores fenced code; moduleStats counts questions, exercises and two-tag questions', () => {
  assert.equal(proseWords('one two\n```ts\nconst a = 1;\n```\nthree'), 3);
  const md = '### Q01.01 · Output · What?\n### Q01.01a · Bug hunt · Output · Why?\n### Exercise 01.1 · X\n';
  assert.deepEqual(moduleStats(md).mix, { Output: 2, 'Bug hunt': 1 });
  assert.equal(moduleStats(md).questions, 2);
  assert.equal(moduleStats(md).exercises, 1);
});

test('flagsFor reports floors, ceilings, the prose cap for capped parts and every D3 rule', () => {
  const row = { part: 'A', ng: false, qMax: 2, exMax: 3 };
  const flags = flagsFor({ questions: 3, exercises: 1, prose: 10_001, mix: { Output: 3 } }, row);
  assert.deepEqual(flags, [
    'questions 3 < floor 15',
    'exercises 1 < floor 2',
    'questions 3 > ceiling 2',
    'prose 10001 > cap 10000',
    'D3: 1 tags < 4',
    'D3: no Trade-off',
    'D3: no Design or Bug hunt',
    'D3: Output on 3/3 (> 60%)',
  ]);
  const angular = { part: 'D', ng: true, qMax: 40, exMax: 6 };
  const mix = { Concept: 10, Output: 10, 'Trade-off': 5, Design: 5 };
  assert.deepEqual(flagsFor({ questions: 30, exercises: 5, prose: 20_000, mix }, angular), []);
});

test('capExceptions reads the PROGRESS.md table; a module within its cap gets a note, not a flag', () => {
  const md = '## A\n## Prose cap exceptions\n\n| Module | Cap | Ruled | Reason |\n|---|---|---|---|\n| 01 | 15,500 | 2026-10-24 | why |\n## B\n| 02 | 9 | 2026-01-01 | x |\n';
  const ex = capExceptions(md);
  assert.deepEqual([...ex], [['01', { cap: 15_500, ruled: '2026-10-24' }]]);
  const row = { part: 'A', ng: false, qMax: 40, exMax: 6 };
  const mix = { Concept: 10, Output: 10, 'Trade-off': 5, Design: 5 };
  const stats = (prose) => ({ questions: 30, exercises: 5, prose, mix });
  assert.deepEqual(flagsFor(stats(15_400), row, ex.get('01')), []);
  assert.equal(capNote(stats(15_400), row, ex.get('01')), 'cap exception 15,500 (ruled 2026-10-24)');
  assert.deepEqual(flagsFor(stats(15_501), row, ex.get('01')), ['prose 15501 > cap 10000']);
  assert.equal(capNote(stats(15_501), row, ex.get('01')), '');
});

test('without a table the prose cap behaves as before', () => {
  const row = { part: 'A', ng: false, qMax: 40, exMax: 6 };
  const mix = { Concept: 10, Output: 10, 'Trade-off': 5, Design: 5 };
  const ex = capExceptions('## Last full verification\n');
  assert.equal(ex.size, 0);
  assert.deepEqual(flagsFor({ questions: 30, exercises: 5, prose: 10_001, mix }, row, ex.get('01')), ['prose 10001 > cap 10000']);
  assert.deepEqual(flagsFor({ questions: 30, exercises: 5, prose: 10_001, mix }, row), ['prose 10001 > cap 10000']);
});
