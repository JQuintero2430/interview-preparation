// Run with: node --test 'labs/tools/*.test.mjs'   (Node 24 does not accept a directory here)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anchorsOf, githubSlug, isPlannedProblem, linksOf, plannedFiles } from './check-links.mjs';

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
  const syllabus = '## 1. Module list\n| # | Slug |\n|---|---|\n| 05 | `js-modules` | A |\n| 22 | `rxjs-foundations` | D |\n## 2. Map\n| 99 | `not-a-module` |\n';
  const planned = plannedFiles(syllabus);
  assert.ok(planned.has('05-js-modules.md') && planned.has('22-rxjs-foundations.md') && planned.has('GLOSSARY.md'));
  assert.equal(planned.has('99-not-a-module.md'), false);
  assert.equal(isPlannedProblem('22-rxjs-foundations.md#2-operators (missing file)', planned), true);
  assert.equal(isPlannedProblem('../GLOSSARY.md (missing file)', planned), true);
  assert.equal(isPlannedProblem('23-typo.md (missing file)', planned), false);
  assert.equal(isPlannedProblem('05-js-modules.md#x (missing anchor)', planned), false);
});
