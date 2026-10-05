import {
  p01Typeof,
  p02Coercion,
  p03Equality,
  p04VarLetIife,
  p05Hoisting,
  p06This,
  p07ClosureCounters,
  p08MicrotaskVsMacrotask,
  p09AsyncAwaitOrder,
  p10InterleavedChains,
  p11ReturningAPromiseFromThen,
  p12MicrotasksBetweenTimers,
  p13ArgumentsAndLength,
  p14KeyOrder,
  p15Sort,
  p16Numbers,
  p17References,
  p18SameValueZero,
  p19Finally,
  p20PromisePassThrough,
  p21ClassBinding,
  p22DefaultsAndNullish,
  p23Generator,
  p24ArrayHoles,
  p25ForEachVsForOf,
  p26ErrorCause,
} from './puzzles';

// Real timers on purpose: every async puzzle flushes with setTimeout(0) ordering.

test('P1 typeof', () => {
  expect(p01Typeof()).toEqual(['object', 'undefined', 'number', 'object', 'function', 'bigint', 'symbol', 'object']);
});

test('P2 coercion', () => {
  expect(p02Coercion()).toEqual(['', '[object Object]', '12', '2', '2', '1', 'NaN', '10', 'null1']);
});

test('P3 equality', () => {
  expect(p03Equality()).toEqual(['true', 'false', 'true', 'true', 'true', 'true', 'false', 'true', 'false', 'true']);
});

test('P4 var, let and IIFE in timer loops', async () => {
  expect(await p04VarLetIife()).toEqual([
    'var3', 'var3', 'var3',
    'let0', 'let1', 'let2',
    'iife0', 'iife1', 'iife2',
  ]);
});

test('P5 hoisting and the TDZ', () => {
  expect(p05Hoisting()).toEqual(['function', 'undefined', 'TypeError', 'ReferenceError']);
});

test('P6 this and binding', () => {
  expect(p06This()).toEqual(['obj', 'TypeError', 'other', 'obj', 'A', 'counter', 'TypeError']);
});

test('P7 closure counters', () => {
  expect(p07ClosureCounters()).toEqual(['1', '2', '1', '3']);
});

test('P8 sync, microtask, macrotask', async () => {
  expect(await p08MicrotaskVsMacrotask()).toEqual(['sync 1', 'sync 2', 'promise', 'microtask', 'timeout']);
});

test('P9 async/await ordering', async () => {
  expect(await p09AsyncAwaitOrder()).toEqual([
    'script start', 'a1 start', 'a2', 'p1', 'script end', 'a1 end', 'then1', 'then2', 'timeout',
  ]);
});

test('P10 interleaved promise chains', async () => {
  expect(await p10InterleavedChains()).toEqual(['a1', 'b1', 'a2', 'b2', 'a3']);
});

test('P11 returning a promise from then costs extra ticks', async () => {
  expect(await p11ReturningAPromiseFromThen()).toEqual(['p1', 'q1', 'q2', 'q3', 'p1-next', 'q4']);
});

test('P12 microtasks run between timers', async () => {
  expect(await p12MicrotasksBetweenTimers()).toEqual(['t1', 'm1', 't2']);
});

test('P13 arguments and function length', () => {
  expect(p13ArgumentsAndLength()).toEqual(['3', '6', '1', '0', '2']);
});

test('P14 property key order', () => {
  expect(p14KeyOrder()).toEqual(['1,2,b,a', '0']);
});

test('P15 sort', () => {
  expect(p15Sort()).toEqual(['1,10,9', 'B,C,a', '3,2,1', '1,2,3|3,1,2', 'true']);
});

test('P16 numbers', () => {
  expect(p16Numbers()).toEqual(['1,NaN,NaN', '0.30000000000000004', 'false', '-Infinity', '9007199254740992']);
});

test('P17 references and copies', () => {
  expect(p17References()).toEqual(['false', '2', '1', '99']);
});

test('P18 SameValueZero', () => {
  expect(p18SameValueZero()).toEqual(['true', '-1', '1', '1', 'undefined']);
});

test('P19 finally', () => {
  expect(p19Finally()).toEqual(['f:finally ran', 'try', 'finally']);
});

test('P20 promise pass-through', async () => {
  expect(await p20PromisePassThrough()).toEqual(['1', 'recovered', 'v']);
});

test('P21 class binding (legacy)', () => {
  expect(p21ClassBinding()).toEqual(['TypeError', 'legacy', 'legacy', 'false', 'true']);
});

test('P22 defaults, ||, ??, ?.', () => {
  expect(p22DefaultsAndNullish()).toEqual(['1', 'null', '0', 'x', '0', 'undefined']);
});

test('P23 generator', () => {
  expect(p23Generator()).toEqual(['created', 'start', 'got hello', 'end']);
});

test('P24 array holes', () => {
  expect(p24ArrayHoles()).toEqual(['3', '[null,null,null]', '0,1,2', '0,1,2']);
});

test('P25 forEach(async) vs for-of', async () => {
  expect(await p25ForEachVsForOf()).toEqual([
    'after forEach', 'forEach 1', 'forEach 2', 'for-of 1', 'for-of 2', 'done',
  ]);
});

test('P26 custom error with cause', () => {
  expect(p26ErrorCause()).toEqual(['true', 'HttpError', 'bad gateway', 'boom', '502']);
});
