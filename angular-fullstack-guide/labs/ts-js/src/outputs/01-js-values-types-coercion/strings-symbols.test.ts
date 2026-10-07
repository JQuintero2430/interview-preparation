// Output questions Q01.10 and Q01.13, and the evidence for Q01.11, Q01.12 and Q01.14
// (sections 3 and 4: strings and symbols).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · strings and symbols', () => {
  it('Q01.10 UTF-16 code units, code points and normalization', async () => {
    const snippet = String.raw`
const smile = '😀';
console.log(smile.length, [...smile].length);
console.log(smile.charCodeAt(0), smile.codePointAt(0));
console.log(smile.slice(0, 1) === '\uD83D');
const composed = 'caf\u00E9';
const decomposed = 'cafe\u0301';
console.log(composed === decomposed, composed.length, decomposed.length);
console.log(composed === decomposed.normalize('NFC'));
console.log('👍🏽'.length, [...'👍🏽'].length);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['2 1', '55357 128512', 'true', 'false 4 5', 'true', '4 2']);
  });

  it('Q01.11 reversing a string: code units, code points, graphemes', async () => {
    const snippet = String.raw`
const reverse = (s) => s.split('').reverse().join('');
const broken = reverse('ab😀');
console.log(broken.length, broken.isWellFormed());
const byCodePoint = (s) => [...s].reverse().join('');
console.log(byCodePoint('ab😀') === '😀ba');
console.log(byCodePoint('ok👍🏽') === '🏽👍ko');
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const byGrapheme = (s) => Array.from(segmenter.segment(s), (g) => g.segment).reverse().join('');
console.log(byGrapheme('ok👍🏽') === '👍🏽ko');
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['4 false', 'true', 'true', 'true']);
  });

  it('Q01.12 a symbol key cannot be added to a frozen object; a WeakMap holds the metadata instead', async () => {
    const snippet = String.raw`
'use strict';
const META = Symbol('plugin-meta');
const frozen = Object.freeze({ name: 'Grace' });
try {
  frozen[META] = { loadedAt: 1 };
} catch (e) {
  console.log(e.name);
}
const side = new WeakMap();
side.set(frozen, { loadedAt: 2 });
console.log(side.get(frozen).loadedAt, Reflect.ownKeys(frozen).length);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['TypeError', '2 1']);
  });

  it('Q01.12 evidence: symbol identity, registry, hidden keys, no implicit string conversion', async () => {
    const snippet = String.raw`
const id = Symbol('id');
const user = { name: 'Ada', [id]: 42 };
console.log(Symbol('id') === Symbol('id'), Symbol.for('id') === Symbol.for('id'));
console.log(Object.keys(user).length, JSON.stringify(user));
console.log(user[id], Object.getOwnPropertySymbols(user).length);
console.log(id.description, String(id));
try {
  console.log('key: ' + id);
} catch (e) {
  console.log(e.name);
}
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['false true', '1 {"name":"Ada"}', '42 1', 'id Symbol(id)', 'TypeError']);
  });

  it('Q01.13 Symbol.toPrimitive hints', async () => {
    const snippet = `
const temp = {
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    return hint === 'string' ? '21°C' : 21;
  },
};
console.log(+temp);
console.log(\`\${temp}\`);
console.log(temp + 1);
console.log(temp == 21);
console.log(temp < 30);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      'hint: number',
      '21',
      'hint: string',
      '21°C',
      'hint: default',
      '22',
      'hint: default',
      'true',
      'hint: number',
      'true',
    ]);
  });

  it('Q01.13 follow-up: Date treats the default hint as string', async () => {
    const snippet = String.raw`
const d = new Date(0);
console.log(typeof (d + 1), typeof (d - 1));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['string number']);
  });

  it('Q01.14 instanceof can be overridden with Symbol.hasInstance', async () => {
    const snippet = String.raw`
class AnythingGoes {
  static [Symbol.hasInstance]() {
    return true;
  }
}
console.log(1 instanceof AnythingGoes, 'text' instanceof AnythingGoes);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['true true']);
  });

  it('Q01.14 an array from another realm fails instanceof but passes Array.isArray', async () => {
    // node:vm creates a second realm (its own globals, its own Array), like an iframe in a browser.
    // The lab has no @types/node, so the specifier is a variable and the module is typed by hand.
    const vmSpecifier = 'node:vm';
    const vm = (await import(vmSpecifier)) as { runInNewContext: (code: string) => unknown };
    const foreign = vm.runInNewContext('[1, 2]');
    expect(foreign instanceof Array).toBe(false);
    expect(Array.isArray(foreign)).toBe(true);
    expect(Object.prototype.toString.call(foreign)).toBe('[object Array]');
  });

  it('Q01.14 evidence: Object.prototype.toString and Symbol.toStringTag', async () => {
    const snippet = String.raw`
const tag = (v) => Object.prototype.toString.call(v);
console.log(tag(null), tag(undefined));
console.log(tag([]), tag(new Date(0)), tag(Promise.resolve()));
class Money {
  get [Symbol.toStringTag]() { return 'Money'; }
}
console.log(tag(new Money()), String(new Money()));
const fake = { [Symbol.toStringTag]: 'Array' };
console.log(tag(fake), Array.isArray(fake));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      '[object Null] [object Undefined]',
      '[object Array] [object Date] [object Promise]',
      '[object Money] [object Money]',
      '[object Array] false',
    ]);
  });
});
