// Run with: node --test 'labs/tools/*.test.mjs'   (Node 24 does not accept a directory here)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { anchorsOf, checkFile, githubSlug, isPlannedProblem, linksOf, plannedFiles } from './check-links.mjs';

test('githubSlug follows GitHub rules, including duplicate suffixes', () => {
  const seen = new Map();
  assert.equal(githubSlug('Q17.08 · Output · What does `effect` log?', seen), 'q1708--output--what-does-effect-log');
  assert.equal(githubSlug('Code', seen), 'code');
  assert.equal(githubSlug('Code', seen), 'code-1');
});

test('anchorsOf collects headings and explicit ids but ignores fenced code', () => {
  const md = '# Title\n<a id="q17-01"></a>\n```md\n# Not a heading\n```\n## 7. Decisions (resolved)';
  assert.deepEqual([...anchorsOf(md)].sort(), ['7-decisions-resolved', 'q17-01', 'title']);
});

test('linksOf skips links inside inline code and code fences', () => {
  const md = '[a](a.md) `[b](b.md)`\n```\n[c](c.md)\n```\n[d](d.md#x "title")';
  assert.deepEqual(linksOf(md), ['a.md', 'd.md#x']);
});

test('plannedFiles reads module slugs from SYLLABUS section 1 only; isPlannedProblem uses them', () => {
  const syllabus = '## 1. Module list\n| # | Slug |\n|---|---|\n| 05 | `java-lambdas-streams-optional` | A |\n| 22 | `java-nio` | N |\n## 2. Map\n| 99 | `not-a-module` |\n';
  const planned = plannedFiles(syllabus);
  assert.ok(planned.has('05-java-lambdas-streams-optional.md') && planned.has('22-java-nio.md'));
  for (const f of ['GLOSSARY.md', 'QUESTION-INDEX.md', 'CHEATSHEET.md', 'MOCK-INTERVIEWS.md', 'README.md', 'PROGRESS.md', 'SOURCES.md']) assert.ok(planned.has(f), f);
  assert.equal(planned.has('99-not-a-module.md'), false);
  assert.equal(isPlannedProblem('22-java-nio.md#2-x (missing file)', planned), true);
  assert.equal(isPlannedProblem('../SOURCES.md (missing file)', planned), true);
  assert.equal(isPlannedProblem('23-typo.md (missing file)', planned), false);
  assert.equal(isPlannedProblem('../../other/README.md (missing file, outside guide)', planned), false);
  assert.equal(isPlannedProblem('05-java-lambdas-streams-optional.md#x (missing anchor)', planned), false);
});

test('checkFile resolves cross-guide links outside the guide root by file and anchor', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'links-'));
  try {
    mkdirSync(join(tmp, 'java', 'modules'), { recursive: true });
    mkdirSync(join(tmp, 'angular', 'modules'), { recursive: true });
    writeFileSync(join(tmp, 'angular', 'modules', '41-x.md'), '# 41. X\n## 2. Auth\n');
    const module = join(tmp, 'java', 'modules', '30-sec.md');
    writeFileSync(module, [
      '[ok](../../angular/modules/41-x.md#2-auth)',
      '[bad anchor](../../angular/modules/41-x.md#nope)',
      '[bad file](../../angular/modules/99-none.md)',
      '[lab](../labs/none/Foo.java)',
      '[web](https://example.com/x.md)',
    ].join('\n'));
    const problems = checkFile(module, new Map(), join(tmp, 'java'));
    assert.deepEqual(problems, [
      '../../angular/modules/41-x.md#nope (missing anchor)',
      '../../angular/modules/99-none.md (missing file, outside guide)',
      '../labs/none/Foo.java (missing file)',
    ]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
