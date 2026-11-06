import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { blocksOf, isSubsequence, checkBlock } from './check-snippets.mjs';

describe('check-snippets', () => {
  it('extracts fenced python blocks and question context', () => {
    const md = `
### Q01.01 · Concept · What is a dunder?

\`\`\`python
class MyClass:
    pass
\`\`\`
<sub>Source: [test](labs/python/tests/test_smoke.py)</sub>
`;
    const blocks = blocksOf(md);
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].lang, 'python');
    assert.ok(blocks[0].after.includes('Source:'));
    assert.ok(blocks[0].question.includes('Q01.01'));
  });

  it('verifies subsequence ordering', () => {
    const needles = ['line 1', 'line 3'];
    const haystack = ['line 1', 'line 2', 'line 3', 'line 4'];
    assert.ok(isSubsequence(needles, haystack));

    const outOfOrder = ['line 3', 'line 1'];
    assert.ok(!isSubsequence(outOfOrder, haystack));
  });

  it('classifies partial blocks as valid (null problem)', () => {
    const block = {
      lang: 'python',
      code: '# Partial: imports omitted\nx = 1',
      line: 10,
      after: '',
      question: '',
    };
    const problem = checkBlock(block, '.', '.', () => '');
    assert.equal(problem, null);
  });

  it('classifies Output question blocks as valid (null problem)', () => {
    const block = {
      lang: 'python',
      code: 'Output: 42',
      line: 20,
      after: '',
      question: '### Q01.02 · Output · What does this print?',
    };
    const problem = checkBlock(block, '.', '.', () => '');
    assert.equal(problem, null);
  });
});
