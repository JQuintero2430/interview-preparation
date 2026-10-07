// Section 8: every "Node 24" cell of the edition table, probed in the running engine. Syntax is checked
// with `new Function`, whose source string no transform touches; APIs are looked up with Reflect.get so
// that the probe asks the engine, not the TypeScript lib.
type Probe = readonly [feature: string, available: () => boolean];

const parses = (source: string) => () => {
  try {
    new Function(source);
    return true;
  } catch {
    return false;
  }
};
const has = (owner: object, key: PropertyKey) => () => typeof Reflect.get(owner, key) === 'function';

const iteratorPrototype = Reflect.get(globalThis, 'Iterator').prototype as object;

const inNode24: Record<string, readonly Probe[]> = {
  ES2015: [
    ['let/const, arrows, classes, destructuring, templates, generators', parses('let a = 1; const f = () => a; class C {} const { x } = { x: 1 }; `${a}`; function* g() { yield 1; }')],
    ['Promise, Map, WeakMap, Proxy, Symbol', () => [Promise, Map, WeakMap, Proxy, Symbol].every((value) => typeof value === 'function')],
  ],
  ES2016: [['Array.prototype.includes', has(Array.prototype, 'includes')], ['**', parses('2 ** 3')]],
  ES2017: [
    ['async functions', parses('async function f() { await 1; }')],
    ['Object.entries, getOwnPropertyDescriptors, padStart', () => [has(Object, 'entries'), has(Object, 'getOwnPropertyDescriptors'), has(String.prototype, 'padStart')].every((probe) => probe())],
  ],
  ES2018: [
    ['for await, object rest/spread', parses('async function f() { for await (const x of []) {} const { a, ...rest } = {}; return { ...rest }; }')],
    ['Promise.prototype.finally', has(Promise.prototype, 'finally')],
    ['RegExp named groups, lookbehind, s flag', parses('/(?<year>\\d{4})(?<=a)./su')],
  ],
  ES2019: [['flat, flatMap, Object.fromEntries', () => [has(Array.prototype, 'flat'), has(Array.prototype, 'flatMap'), has(Object, 'fromEntries')].every((probe) => probe())], ['optional catch binding', parses('try {} catch {}')]],
  ES2020: [
    ['BigInt, globalThis, Promise.allSettled', () => typeof BigInt === 'function' && typeof globalThis === 'object' && has(Promise, 'allSettled')()],
    ['?? and ?.', parses('a ?? b; a?.b;')],
    ['import()', parses('import("./x.mjs");')],
  ],
  ES2021: [
    ['Promise.any, AggregateError, WeakRef, FinalizationRegistry', () => has(Promise, 'any')() && [AggregateError, WeakRef, FinalizationRegistry].every((value) => typeof value === 'function')],
    ['logical assignment, numeric separators', parses('a ||= 1; a &&= 2; a ??= 3; 1_000;')],
    ['String.prototype.replaceAll', has(String.prototype, 'replaceAll')],
  ],
  ES2022: [
    ['class fields, private methods, static blocks, #x in obj', parses('class A { #x = 1; static {} #m() {} has(o) { return #x in o; } }')],
    ['at, Object.hasOwn, error cause', () => has(Array.prototype, 'at')() && has(Object, 'hasOwn')() && new Error('x', { cause: 1 }).cause === 1],
  ],
  ES2023: [
    ['toSorted, with, findLast', () => [has(Array.prototype, 'toSorted'), has(Array.prototype, 'with'), has(Array.prototype, 'findLast')].every((probe) => probe())],
    ['symbols as WeakMap keys', () => new WeakMap<WeakKey, number>().set(Symbol('key'), 1).has(Symbol('other')) === false],
  ],
  ES2024: [
    ['Promise.withResolvers, Object.groupBy, Map.groupBy, isWellFormed', () => [has(Promise, 'withResolvers'), has(Object, 'groupBy'), has(Map, 'groupBy'), has(String.prototype, 'isWellFormed')].every((probe) => probe())],
    ['RegExp v flag', parses('/[\\p{L}--[a-z]]/v')],
  ],
  ES2025: [
    ['iterator helpers, Set methods, Promise.try, RegExp.escape', () => [has(iteratorPrototype, 'map'), has(Set.prototype, 'union'), has(Promise, 'try'), has(RegExp, 'escape')].every((probe) => probe())],
    ['Float16Array, RegExp modifiers, duplicate named groups', () => typeof Reflect.get(globalThis, 'Float16Array') === 'function' && parses('/(?i:a)b/; /(?<y>a)|(?<y>b)/')()],
  ],
};

const es2026InNode24: readonly (readonly [string, () => boolean, boolean])[] = [
  ['Error.isError', has(Error, 'isError'), true],
  ['Array.fromAsync', has(Array, 'fromAsync'), true],
  ['JSON.rawJSON (JSON.parse source text access)', has(JSON, 'rawJSON'), true],
  ['Map.prototype.getOrInsert (Upsert)', has(Map.prototype, 'getOrInsert'), false],
  ['Iterator.concat (Iterator Sequencing)', has(Reflect.get(globalThis, 'Iterator') as object, 'concat'), false],
  ['Uint8Array.fromBase64', has(Uint8Array, 'fromBase64'), false],
  ['Math.sumPrecise', has(Math, 'sumPrecise'), false],
];

const finishedForEs2027InNode24: readonly (readonly [string, () => boolean, boolean])[] = [
  ['using / await using', parses('{ using resource = null; }'), true],
  ['DisposableStack', () => typeof Reflect.get(globalThis, 'DisposableStack') === 'function', true],
  ['Atomics.pause', has(Atomics, 'pause'), true],
  ['Temporal', () => Reflect.get(globalThis, 'Temporal') !== undefined, false],
  ['Iterator.zip (Joint Iteration)', has(Reflect.get(globalThis, 'Iterator') as object, 'zip'), false],
  ['Iterator.prototype.chunks, includes, join', () => [has(iteratorPrototype, 'chunks'), has(iteratorPrototype, 'includes'), has(iteratorPrototype, 'join')].some((probe) => probe()), false],
];

describe('Module 05 · section 8: features by edition in Node 24', () => {
  for (const [edition, probes] of Object.entries(inNode24)) {
    it(`Section 8: every ${edition} feature in the table is available in Node 24`, () => {
      expect(probes.filter(([, available]) => !available()).map(([feature]) => feature)).toEqual([]);
    });
  }

  it('Section 8: ES2026 is only partly available in Node 24', () => {
    expect(es2026InNode24.map(([feature, available]) => [feature, available()])).toEqual(
      es2026InNode24.map(([feature, , expected]) => [feature, expected]),
    );
  });

  it('Section 8: of the features finished for ES2027, Node 24 has using, DisposableStack and Atomics.pause', () => {
    expect(finishedForEs2027InNode24.map(([feature, available]) => [feature, available()])).toEqual(
      finishedForEs2027InNode24.map(([feature, , expected]) => [feature, expected]),
    );
  });
});
