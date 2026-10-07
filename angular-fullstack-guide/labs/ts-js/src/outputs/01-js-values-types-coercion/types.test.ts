// Output question Q01.02 and the evidence for bug hunt Q01.03 (section 1: values and types).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · types and wrapper objects', () => {
  it('Q01.02 typeof on every kind of value', async () => {
    const snippet = String.raw`
console.log(typeof null);
console.log(typeof undefined);
console.log(typeof notDeclaredAnywhere);
console.log(typeof NaN);
console.log(typeof 10n);
console.log(typeof Symbol('id'));
console.log(typeof []);
console.log(typeof function () {});
console.log(typeof class {});
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      'object',
      'undefined',
      'undefined',
      'number',
      'bigint',
      'symbol',
      'object',
      'function',
      'function',
    ]);
  });

  it('Q01.03 the badge bug: strict code throws on the property write', async () => {
    const snippet = String.raw`
'use strict'; // the file is an ES module in the app; this makes a script behave the same
function badge(user) {
  const label = user.name;
  label.highlight = user.isAdmin; // remember the flag on the label
  const admin = new Boolean(user.isAdmin); // an "explicit" boolean
  return admin ? '★ ' + label : label;
}
try {
  console.log(badge({ name: 'Ada', isAdmin: false }));
} catch (e) {
  console.log(e.name);
}
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['TypeError']);
  });

  it('Q01.03 the badge bug: sloppy code loses the write and stars every user', async () => {
    const snippet = String.raw`
function badge(user) {
  const label = user.name;
  label.highlight = user.isAdmin; // remember the flag on the label
  const admin = new Boolean(user.isAdmin); // an "explicit" boolean
  return admin ? '★ ' + label : label;
}
console.log(badge({ name: 'Ada', isAdmin: false }));
console.log(new Boolean(false) == false);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['★ Ada', 'true']);
  });

  it('Q01.03 evidence: wrapper objects and properties on primitives', async () => {
    const snippet = String.raw`
'use strict';
const s = 'hi';
console.log(s.length, s.toUpperCase());
try {
  s.flag = true;
  console.log('stored', s.flag);
} catch (e) {
  console.log(e.name);
}
const b = new Boolean(false);
console.log(b ? 'truthy' : 'falsy', typeof b);
console.log(new String('a') == 'a', new String('a') === 'a');
console.log(new String('a') == new String('a'));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['2 HI', 'TypeError', 'truthy object', 'true false', 'false']);
  });

  it('Q01.03 follow-up: in sloppy mode the write is silently lost', async () => {
    const snippet = String.raw`
const s = 'hi';
s.flag = true;
console.log(s.flag);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['undefined']);
  });

  it('Q01.02 follow-up: typeof in the temporal dead zone throws ReferenceError', async () => {
    const snippet = String.raw`
try { (() => { typeof tdz; let tdz; })(); } catch (error) { console.log(error.name); }
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['ReferenceError']);
  });
});
