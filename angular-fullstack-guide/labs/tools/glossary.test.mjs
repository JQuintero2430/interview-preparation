// Run with: node --test 'labs/tools/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupEntries, normalizeKey, parseTerms, ParseError, renderGlossary } from './glossary.mjs';

const FIXTURE = [
  '# Glossary terms', 'intro', '',
  '## Module 04', '',
  '- **zone.js**: the patching library ([04 §1](../modules/04-x.md#1-a)).',
  '- **`@Input`**: a decorator input ([04 §2](../../modules/04-x.md#2-b)).',
  '## Module 17', '',
  '- **zone.js** (as used in 17): patched async, owner [04](../modules/04-x.md) ([17 §3](../modules/17-y.md#3-c)).',
].join('\n');

test('normalizeKey drops backticks, the "(as used in N)" note and case', () => {
  assert.equal(normalizeKey('`OnPush` (as used in 14)'), 'onpush');
});

test('parseTerms rewrites ../modules/ and ../../modules/ to modules/ and tags the module', () => {
  const e = parseTerms(FIXTURE);
  assert.equal(e.length, 3);
  assert.equal(e[1].link.url, 'modules/04-x.md#2-b');
  assert.ok(!e[2].def.includes('../'));
  assert.equal(e[2].key, 'zone.js');
});

test('zone.js in two modules gives one entry, anchor zonejs and one also-in link; @Input is under Symbols', () => {
  const groups = groupEntries(parseTerms(FIXTURE));
  assert.equal(groups.length, 2);
  const md = renderGlossary(groups);
  assert.equal(md.match(/<a id="zonejs"><\/a>/g).length, 1);
  assert.match(md, /also in \[17 §3\]\(modules\/17-y\.md#3-c\)$/m);
  assert.ok(md.indexOf('## Symbols') > md.indexOf('## Z'));
  assert.ok(md.indexOf('**@Input**') > md.indexOf('## Symbols'));
});

test('a line that does not parse throws, naming the line', () => {
  assert.throws(() => parseTerms('## Module 01\n- **a**: no link here.'), (e) => e instanceof ParseError && e.message.includes('line 2'));
});
