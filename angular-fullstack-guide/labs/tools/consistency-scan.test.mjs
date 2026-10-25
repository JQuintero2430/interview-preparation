// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiConflicts, chunkOf, duplicateQuestions, glossaryDuplicates, glossaryEntries, headerChecks, isCanonical, nonCanonical, render, similar, syllabusPrereqs } from './consistency-scan.mjs';

const mod = (num, markdown) => ({ num, file: `${num}-x.md`, markdown });

test('every canonical marker form is accepted', () => {
  const forms = ['Developer preview since v17', 'Experimental since v20.1', 'Deprecated since v18 — use `x`', 'Removed in v19',
    'Changed in v17.2: new default', 'Stable since v20.0', 'Added in v17.0', 'Baseline 2024: newly available, per MDN',
    'Baseline 2023: widely available, per MDN', 'Baseline: limited availability, per MDN'];
  for (const f of forms) assert.ok(isCanonical(f), f);
  assert.deepEqual(nonCanonical([mod('01', forms.map((f) => `\`a\` [${f}]`).join('\n'))]), []);
});

test('one variant per keyword is reported, fenced code and links are skipped', () => {
  const variants = ['Developer preview v17', 'Experimental v20', 'Deprecated v18', 'Removed v19', 'Changed v17', 'Stable v20', 'Added v17', 'Baseline 2024'];
  const md = `${variants.map((v) => `[${v}]`).join('\n')}\n\`\`\`\n[Stable v1]\n\`\`\`\n[Stable v2](x.md)`;
  const groups = nonCanonical([mod('12', md)]);
  assert.equal(groups.length, 8);
  assert.ok(groups.every((g) => g.items.length === 1 && g.items[0].module.num === '12'));
  assert.equal(chunkOf('12'), 'X-02');
});

test('an API with two Stable since versions is reported; a single marker is not', () => {
  const a = mod('17', 'The `effect` function [Stable since v20.0] here.\n`only` [Stable since v1]');
  const b = mod('22', 'The `effect` function [Stable since v19.0] here.');
  const found = apiConflicts([a, b]);
  assert.equal(found.length, 1);
  assert.equal(found[0].api, 'effect');
  assert.equal(found[0].markers.length, 2);
  assert.match(render([a, b]), /X-03|X-02/);
});

test('Deprecated in one module and Stable in another conflict', () => {
  const found = apiConflicts([mod('01', '`f` [Deprecated since v18 — use `g`]'), mod('02', '`f` [Stable since v17]')]);
  assert.equal(found.length, 1);
});

test('titles at Jaccard 0.6 are reported, at 0.5 are not, same module is skipped', () => {
  assert.ok(similar('alpha beta gamma delta', 'alpha beta gamma epsilon'));
  assert.ok(!similar('alpha beta', 'alpha beta gamma delta'));
  const q = (id, t) => `### ${id} · Output · ${t}\n`;
  const hit = duplicateQuestions([mod('01', q('Q01.01', 'alpha beta gamma delta')), mod('02', q('Q02.01', 'alpha beta gamma epsilon'))]);
  assert.equal(hit.length, 1);
  const miss = duplicateQuestions([mod('01', q('Q01.01', 'alpha beta')), mod('02', q('Q02.01', 'alpha beta gamma delta'))]);
  assert.equal(miss.length, 0);
  assert.equal(duplicateQuestions([mod('01', q('Q01.01', 'same title') + q('Q01.02', 'same title'))]).length, 0);
});

test('output has five headings and no Markdown link', () => {
  const out = render([mod('01', '`a` [Stable v1]\n### Q01.01 · Output · See [x](y.md) now')]);
  assert.equal((out.match(/^## /gm) ?? []).length, 5);
  assert.equal((out.match(/\]\(/g) ?? []).length, 0);
});

test('a term in two modules is reported with both definitions, "(as used in NN)" is normalized away', () => {
  const g = ['## Module 01', '- **`Scope`**: first def ([01](x.md)).', '- **only**: alone ([01](x.md)).',
    '## Module 13', '- **scope** (as used in 01): second def ([13](y.md)).', '## Module 14', '- **scope**: third def.'].join('\n');
  const dups = glossaryDuplicates(glossaryEntries(g));
  assert.equal(dups.length, 1);
  assert.equal(dups[0].key, 'scope');
  assert.deepEqual(dups[0].entries.map((e) => e.module), ['01', '13', '14']);
  const out = render([], { glossary: g });
  assert.match(out, /first def/);
  assert.match(out, /second def/);
  assert.match(out, /X-01/);
  assert.equal((out.match(/\]\(/g) ?? []).length, 0);
});

test('a missing prerequisite and a missing Leads-to are reported', () => {
  const syllabus = '## 1. Module list\n\n| # | Slug | Part | Kind | Q | Ex | Prerequisites |\n|---|---|---|---|---|---|---|\n' +
    '| 01 | `a` | A | — | 2 | 1 | none |\n| 02 | `b` | A | — | 2 | 1 | 01 |\n| 03 | `c` | A | — | 2 | 1 | 01, 02 |\n\n## 2. Next\n';
  assert.deepEqual([...syllabusPrereqs(syllabus)], [['01', []], ['02', ['01']], ['03', ['01', '02']]]);
  const hdr = (pre, lead, applies) => `> **Prerequisites:** ${pre}\n> **Leads to:** ${lead}\n> **Applies to:** ${applies}\n`;
  const mods = [mod('01', hdr('none', '[02. B](02-b.md)', 'Node 24')), mod('02', hdr('[01. A](01-a.md#x)', 'none', 'TS 6.0')),
    mod('03', hdr('[02. B](02-b.md)', 'none', 'Angular 22'))];
  const [c1, c2, c3] = headerChecks(mods, syllabusPrereqs(syllabus));
  assert.deepEqual([c1.missing, c1.extra, c1.noBack], [[], [], []]);
  assert.deepEqual(c2.noBack, []);
  assert.deepEqual(c3.missing, ['01']);
  assert.deepEqual(c3.noBack, ['02']);
  assert.equal(c3.applies, 'Angular 22');
  const out = render(mods, { syllabus });
  assert.match(out, /X-01 03 Prerequisites missing against SYLLABUS: 01/);
  assert.match(out, /X-01 03 lists 02 as prerequisite, but 02 Leads to omits 03/);
  assert.match(out, /X-01 02: TS 6\.0/);
});

test('the J4 variant forms are accepted', () => {
  const ok = ['Added in ES2022', 'Added in ES2023, ECMA-402 Intl.NumberFormat v3', 'Added in TypeScript 5.4',
    'Changed in TypeScript 6.0: strict by default', 'Changed in Node 22.12: no flag needed', 'Stable since Node 24.12',
    'Added in NgRx v19.1', 'Experimental since TanStack Query v5.12.1', 'Added in v22.0.4',
    'Deprecated since v7.5.5 — use retry with delay'];
  for (const f of ok) assert.ok(isCanonical(f), f);
  const bad = ['Added in Angular 14', 'Stable since Node.js v24.12.0', 'Changed in v17', 'Deprecated since v7.0 — gone'];
  for (const f of bad) assert.ok(!isCanonical(f), f);
});

test('bare Changed for ES and TypeScript is accepted', () => {
  for (const f of ['Changed in ES2023', 'Changed in TypeScript 3.9']) assert.ok(isCanonical(f), f);
});

test('Deprecated without a replacement is accepted in three shapes', () => {
  for (const f of ['Deprecated since v22.2', 'Deprecated since v7.0 — no replacement', 'Deprecated since v19.0 — remove it']) assert.ok(isCanonical(f), f);
});

test('marker-like text inside an inline code span is skipped', () => {
  assert.deepEqual(nonCanonical([mod('13', 'The `[Deprecated]` marker is a mention.')]), []);
  assert.equal(nonCanonical([mod('13', '`a` [Deprecated]')]).length, 1);
});
