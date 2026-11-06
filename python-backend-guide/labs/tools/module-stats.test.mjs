import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { syllabusRows, proseWords, questionTags, moduleStats, flagsFor } from './module-stats.mjs';

describe('module-stats', () => {
  it('parses syllabus rows correctly', () => {
    const syllabus = `
## 1. Module list at a glance

| # | Slug | Part | Kind | Q | Ex | Prose cap | Lab | Prerequisites |
|---|---|---|---|---|---|---|---|---|
| 01 | \`python-data-model-and-dunders\` | A · Python | core | 30 | 4 | 18000 | python | none |
| 08 | \`python-stdlib-functools-itertools-logging\` | A | supporting | 18 | 2 | 9000 | python | 04 |
`;
    const rows = syllabusRows(syllabus);
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0], {
      num: '01',
      slug: 'python-data-model-and-dunders',
      part: 'A',
      kind: 'core',
      qMax: 30,
      exMax: 4,
      proseCap: 18000,
      lab: 'python',
    });
  });

  it('counts prose words excluding code blocks', () => {
    const md = `
Here are ten words in this sentence to test counting prose.
\`\`\`python
def hidden():
    pass
\`\`\`
And five more words here.
`;
    const count = proseWords(md);
    assert.equal(count, 16);
  });

  it('extracts question tags from headings', () => {
    const md = `
### Q01.01 · Concept · What is a dunder?
### Q01.02 · Difference · Trade-off · Mutable vs Immutable
### Q01.03 · Output · What does this print?
`;
    const tags = questionTags(md);
    assert.deepEqual(tags, [
      ['Concept'],
      ['Difference', 'Trade-off'],
      ['Output'],
    ]);
  });

  it('evaluates flags for limits and D3 criteria', () => {
    const row = { num: '01', slug: 'test', part: 'A', kind: 'core', qMax: 30, exMax: 4, proseCap: 18000, lab: 'python' };
    const statsUnderFloor = { questions: 5, exercises: 1, prose: 5000, mix: {} };
    const flags = flagsFor(statsUnderFloor, row);
    assert.ok(flags.some((f) => f.includes('Q under floor')));
    assert.ok(flags.some((f) => f.includes('Ex under floor')));
  });
});
