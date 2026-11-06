import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { githubSlug, anchorsOf, linksOf, plannedFiles, javaPlannedSlugs, isPlannedProblem } from './check-links.mjs';

describe('check-links', () => {
  it('computes github heading slugs', () => {
    const seen = new Map();
    assert.equal(githubSlug('1. Introduction & Overview', seen), '1-introduction--overview');
    assert.equal(githubSlug('Heading', seen), 'heading');
    assert.equal(githubSlug('Heading', seen), 'heading-1');
  });

  it('extracts anchors from headings and anchor tags', () => {
    const md = `
# Title
## Section One
<a id="custom-anchor"></a>
### Another Section
`;
    const anchors = anchorsOf(md);
    assert.ok(anchors.has('title'));
    assert.ok(anchors.has('section-one'));
    assert.ok(anchors.has('custom-anchor'));
    assert.ok(anchors.has('another-section'));
  });

  it('extracts relative markdown links while skipping code blocks', () => {
    const md = `
Here is a [link](modules/01-first.md#intro).
\`[inline code link](skip-me.md)\`
\`\`\`python
# [code block](skip-this-too.md)
\`\`\`
Another [link](https://external.com).
`;
    const links = linksOf(md);
    assert.deepEqual(links, ['modules/01-first.md#intro', 'https://external.com']);
  });

  it('parses planned files from SYLLABUS §1', () => {
    const syllabus = `
## 1. Module list at a glance

| # | Slug | Part | Kind | Q | Ex | Prose cap | Lab | Prerequisites |
|---|---|---|---|---|---|---|---|---|
| 01 | \`test-slug\` | A | core | 30 | 4 | 18000 | python | none |
`;
    const planned = plannedFiles(syllabus);
    assert.ok(planned.has('01-test-slug.md'));
    assert.ok(planned.has('GLOSSARY.md'));
  });

  it('parses planned slugs from Java SYLLABUS §1', () => {
    const javaSyllabus = `
## 1. Module list at a glance

| 17 | \`spring-transactions\` | D | core | 40 | 6 | 23000 | spring-transactions | 16 |
`;
    const slugs = javaPlannedSlugs(javaSyllabus);
    assert.ok(slugs.has('17-spring-transactions'));
  });

  it('recognizes planned problems for internal and cross-guide links', () => {
    const planned = new Set(['01-test-slug.md']);
    const javaPlanned = new Set(['17-spring-transactions']);

    // Internal planned module
    assert.ok(isPlannedProblem('modules/01-test-slug.md (missing file)', planned, javaPlanned));

    // Cross-guide planned module
    assert.ok(isPlannedProblem('../java-backend-guide/modules/17-spring-transactions.md (missing file, outside guide)', planned, javaPlanned));

    // Cross-guide unlisted module (failure case)
    assert.ok(!isPlannedProblem('../java-backend-guide/modules/99-non-existent.md (missing file, outside guide)', planned, javaPlanned));
  });
});
