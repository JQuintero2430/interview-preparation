// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, parseModule, partNames, renderIndex } from './question-index.mjs';

const SCRIPT = fileURLToPath(new URL('./question-index.mjs', import.meta.url));
const SYLLABUS = '### Part A · JavaScript core\n### Part B · TypeScript\n## 1. List\n'
  + '| # | Slug | Part | Kind | Q | Ex | Prerequisites |\n|---|---|---|---|---|---|---|\n'
  + '| 01 | `values` | A · JavaScript | — | 22 | 3 | none |\n| 02 | `types` | B · TypeScript | — | 22 | 3 | 01 |\n## 2. Map\n';
const M01 = '# 01. Values\n\n<a id="q01-01"></a>\n### Q01.01 · Concept · What is a value?\n\n'
  + '<a id="q01-01a"></a>\n### Q01.01a · Bug hunt · Output · A | B: which wins?\n';
const M02 = '# 02. Types\n\n<a id="q02-01"></a>\n### Q02.01 · Trade-off · `any` or `unknown`?\n';

function fixture(m1 = M01) {
  const root = mkdtempSync(join(tmpdir(), 'qindex-'));
  mkdirSync(join(root, 'modules'));
  writeFileSync(join(root, 'SYLLABUS.md'), SYLLABUS);
  writeFileSync(join(root, 'modules', '01-values.md'), m1);
  writeFileSync(join(root, 'modules', '02-types.md'), M02);
  return root;
}

test('partNames reads the Part headings', () => {
  assert.deepEqual(partNames(SYLLABUS), { A: 'JavaScript core', B: 'TypeScript' });
});

test('parseModule keeps letter suffixes, tags and titles, and reports a missing anchor', () => {
  const ok = parseModule(M01);
  assert.equal(ok.title, 'Values');
  assert.deepEqual(ok.missing, []);
  assert.deepEqual(ok.questions.map((q) => [q.id, q.anchor, q.tags, q.title]), [
    ['Q01.01', 'q01-01', ['Concept'], 'What is a value?'],
    ['Q01.01a', 'q01-01a', ['Bug hunt', 'Output'], 'A | B: which wins?'],
  ]);
  assert.deepEqual(parseModule('# 01. X\n\n### Q01.01 · Concept · No anchor\n').missing, ['Q01.01']);
  assert.deepEqual(parseModule('# 01. X\n<a id="q01-02"></a>\n### Q01.01 · Concept · Wrong anchor\n').missing, ['Q01.01']);
});

test('renderIndex writes totals, parts, links to the explicit anchor and escapes pipes', () => {
  const root = fixture();
  try {
    const { text, missing } = buildIndex(root);
    assert.deepEqual(missing, []);
    assert.match(text, /\*\*3 questions in 2 modules\.\*\*/);
    assert.match(text, /^## Part A · JavaScript core$/m);
    assert.match(text, /^## Part B · TypeScript$/m);
    assert.match(text, /^### 02 · Types$/m);
    assert.match(text, /^\| \[Q01\.01a\]\(modules\/01-values\.md#q01-01a\) \| Bug hunt · Output \| A \\\| B: which wins\? \|$/m);
    assert.equal((text.match(/^\| \[Q\d{2}\.\d{2}[a-z]?\]/gm) ?? []).length, 3);
    assert.equal(renderIndex([], {}).includes('**0 questions in 0 modules.**'), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CLI: stdout by default, --write then --check exit 0, a changed file exits 1, a missing anchor exits 2', () => {
  const root = fixture();
  try {
    const run = (...a) => spawnSync(process.execPath, [SCRIPT, ...a, root], { encoding: 'utf8' });
    assert.equal(run('--check').status, 1);
    assert.equal(run().status, 0);
    assert.equal(run('--write').status, 0);
    assert.equal(run('--check').status, 0);
    writeFileSync(join(root, 'QUESTION-INDEX.md'), `${readFileSync(join(root, 'QUESTION-INDEX.md'), 'utf8')}x\n`);
    assert.equal(run('--check').status, 1);
    writeFileSync(join(root, 'modules', '01-values.md'), M01.replace('<a id="q01-01"></a>\n', ''));
    const bad = run();
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /01-values\.md: Q01\.01/);
    assert.equal(bad.stdout, '');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
