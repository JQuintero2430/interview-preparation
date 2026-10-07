// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocksOf, checkBlock } from './check-snippets.mjs';

const files = { '/g/labs/a.ts': 'export const a = 1;\nexport const b = 2;  \n\nexport const c = 3;\n' };
const read = (path) => files[path];
const check = (md) => blocksOf(md).map((b) => checkBlock(b, '/g/modules', '/g', read));

test('blocksOf finds fenced blocks with their language and the lines after them', () => {
  const [block] = blocksOf('x\n```ts\nconst a = 1;\n```\n<sub>Source: s</sub>\n');
  assert.deepEqual([block.lang, block.code, block.line], ['ts', 'const a = 1;', 2]);
  assert.match(block.after, /Source/);
});

test('Complete snippets must equal their source file, trailing whitespace ignored', () => {
  const src = '\n<sub>Source: [a.ts](../labs/a.ts)</sub>';
  assert.deepEqual(check('```ts\nexport const a = 1;\nexport const b = 2;\n\nexport const c = 3;\n```' + src), [null]);
  assert.deepEqual(check('```ts\nexport const a = 9;\n```' + src), ['complete snippet differs from ../labs/a.ts']);
  assert.deepEqual(check('```ts\nx\n```\n<sub>Source: [z](../labs/z.ts)</sub>'), ['complete source missing: ../labs/z.ts']);
});

test('Excerpts must keep their lines in file order', () => {
  assert.deepEqual(check('```ts\n// Excerpt of labs/a.ts\n  export const a = 1;\n\nexport const c = 3;\n```'), [null]);
  assert.deepEqual(check('```ts\n// Excerpt of labs/a.ts\nexport const c = 3;\nexport const a = 1;\n```'), [
    'excerpt lines not found in order in labs/a.ts',
  ]);
  assert.deepEqual(check('```ts\n// Excerpt of labs/nope.ts\nx\n```'), ['excerpt source missing: labs/nope.ts']);
  assert.deepEqual(check('```ts\n// Excerpt of labs/a.ts: the constants\nexport const b = 2;\n```'), [null]);
});

test('blocks under an Output question are skipped; other questions and later sections are not', () => {
  const md = '### Q04.18 · Bug hunt · Output · Which catch runs?\n```ts\nfoo();\n```\n### Q04.19 · Bug hunt · What is wrong?\n```ts\nfoo();\n```\n'
    + '### Q04.20 · Output · Print?\n## Hands-on exercises\n```ts\nfoo();\n```';
  assert.deepEqual(check(md), [null, 'unclassified', 'unclassified']);
  const marked = '### Q17.02 · Output · Print?\n```ts\n// Excerpt of labs/a.ts\nnot in the file\n```';
  assert.deepEqual(check(marked), ['excerpt lines not found in order in labs/a.ts']);
});

test('Partial blocks and non-TS/JS blocks are skipped; anything else is unclassified', () => {
  assert.deepEqual(check('```ts\n// Partial: illustrative\nfoo();\n```\n```html\n<p></p>\n```\n```js\nfoo();\n```'), [
    null,
    null,
    'unclassified',
  ]);
});
