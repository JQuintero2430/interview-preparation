/* Output-prediction puzzles for section 1.21.
 * Every puzzle records what it "prints" into an array instead of using console,
 * so puzzles.test.ts can assert the exact output. Async puzzles use only
 * Promise / queueMicrotask / setTimeout(0) ordering and flush with `tick()`. */

/** Resolves after every timer already queued with delay 0 (timers fire in creation order). */
const tick = (): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, 0));

// Helpers that hide operand types from TypeScript so that "illegal" JS still compiles.
const add = (a: unknown, b: unknown): unknown => (a as number) + (b as number);
const sub = (a: unknown, b: unknown): unknown => (a as number) - (b as number);
const mul = (a: unknown, b: unknown): unknown => (a as number) * (b as number);
const looseEq = (a: unknown, b: unknown): boolean => a == b;
const attempt = (fn: () => unknown): string => {
  try {
    return String(fn());
  } catch (e) {
    return e instanceof Error ? e.name : 'non-error thrown';
  }
};

// 1
export function p01Typeof(): string[] {
  const values: unknown[] = [null, undefined, NaN, [], () => 1, 10n, Symbol('s'), new Date(0)];
  return values.map((v) => typeof v);
}

// 2
export function p02Coercion(): string[] {
  return [
    add([], []),
    add([], {}),
    add(1, '2'),
    sub('3', 1),
    add(true, 1),
    add(null, 1),
    add(undefined, 1),
    mul('5', '2'),
    add(add([], null), 1),
  ].map(String);
}

// 3
export function p03Equality(): string[] {
  const negZero = -Number('0'); // -0, built at runtime (lint forbids writing `=== -0`)
  const emptyArray: unknown[] = []; // `![]` written literally is a TS error (always truthy), so negate a variable
  return [
    looseEq(null, undefined),
    looseEq(null, 0),
    looseEq('', 0),
    looseEq('0', false),
    looseEq([], false),
    looseEq([], !emptyArray),
    looseEq(NaN, NaN),
    Object.is(NaN, NaN),
    Object.is(0, negZero),
    0 === negZero,
  ].map(String);
}

// 4 (async)
export async function p04VarLetIife(): Promise<string[]> {
  const log: string[] = [];
  // eslint-disable-next-line no-var
  for (var i = 0; i < 3; i++) setTimeout(() => log.push(`var${i}`), 0);
  for (let j = 0; j < 3; j++) setTimeout(() => log.push(`let${j}`), 0);
  // eslint-disable-next-line no-var
  for (var k = 0; k < 3; k++) {
    ((copy: number) => {
      setTimeout(() => log.push(`iife${copy}`), 0);
    })(k);
  }
  await tick();
  return log;
}

// 5
export function p05Hoisting(): string[] {
  const log: string[] = [];
  const readC = () => c;
  log.push(typeof hoisted);
  log.push(typeof a);
  try {
    (f as () => void)();
  } catch (e) {
    log.push((e as Error).name);
  }
  try {
    readC();
  } catch (e) {
    log.push((e as Error).name);
  }
  function hoisted(): void {}
  // The assignments are never read: the puzzle is about what the reads above see before them.
  // eslint-disable-next-line no-var, no-useless-assignment
  var a: number | undefined = 1;
  // eslint-disable-next-line no-var, no-useless-assignment
  var f: (() => void) | undefined = function () {};
  const c = 1;
  return log;
}

// 6
export function p06This(): string[] {
  const obj = {
    name: 'obj',
    regular(this: { name: string }) {
      return this.name;
    },
  };
  const detached = obj.regular;

  class Counter {
    name = 'counter';
    arrow = () => this.name;
    method() {
      return this.name;
    }
  }
  const { arrow, method } = new Counter();

  return [
    obj.regular(),
    attempt(detached as () => string),
    detached.call({ name: 'other' }),
    detached.bind(obj)(),
    detached.bind({ name: 'A' }).bind({ name: 'B' })(),
    arrow(),
    attempt(method as () => string),
  ];
}

// 7
export function p07ClosureCounters(): string[] {
  const makeCounter = () => {
    let n = 0;
    return () => ++n;
  };
  const c1 = makeCounter();
  const c2 = makeCounter();
  return [c1(), c1(), c2(), c1()].map(String);
}

// 8 (async)
export async function p08MicrotaskVsMacrotask(): Promise<string[]> {
  const log: string[] = [];
  log.push('sync 1');
  setTimeout(() => log.push('timeout'), 0);
  void Promise.resolve().then(() => log.push('promise'));
  queueMicrotask(() => log.push('microtask'));
  log.push('sync 2');
  await tick();
  return log;
}

// 9 (async)
export async function p09AsyncAwaitOrder(): Promise<string[]> {
  const log: string[] = [];
  async function a2(): Promise<void> {
    log.push('a2');
  }
  async function a1(): Promise<void> {
    log.push('a1 start');
    await a2();
    log.push('a1 end');
  }
  log.push('script start');
  setTimeout(() => log.push('timeout'), 0);
  void a1();
  void new Promise<void>((resolve) => {
    log.push('p1');
    resolve();
  })
    .then(() => log.push('then1'))
    .then(() => log.push('then2'));
  log.push('script end');
  await tick();
  return log;
}

// 10 (async)
export async function p10InterleavedChains(): Promise<string[]> {
  const log: string[] = [];
  void Promise.resolve()
    .then(() => log.push('a1'))
    .then(() => log.push('a2'))
    .then(() => log.push('a3'));
  void Promise.resolve()
    .then(() => log.push('b1'))
    .then(() => log.push('b2'));
  await tick();
  return log;
}

// 11 (async)
export async function p11ReturningAPromiseFromThen(): Promise<string[]> {
  const log: string[] = [];
  void Promise.resolve()
    .then(() => {
      log.push('p1');
      return Promise.resolve('x');
    })
    .then(() => log.push('p1-next'));
  void Promise.resolve()
    .then(() => log.push('q1'))
    .then(() => log.push('q2'))
    .then(() => log.push('q3'))
    .then(() => log.push('q4'));
  await tick();
  return log;
}

// 12 (async)
export async function p12MicrotasksBetweenTimers(): Promise<string[]> {
  const log: string[] = [];
  setTimeout(() => {
    log.push('t1');
    void Promise.resolve().then(() => log.push('m1'));
  }, 0);
  setTimeout(() => log.push('t2'), 0);
  await tick();
  return log;
}

// 13
export function p13ArgumentsAndLength(): string[] {
  function count(): number {
    return arguments.length;
  }
  function sum(): number {
    // eslint-disable-next-line prefer-rest-params
    return Array.prototype.slice.call(arguments).reduce((s: number, n: number) => s + n, 0);
  }
  function withDefault(a: number, b = 2, c?: number) {
    return [a, b, c];
  }
  const rest = (...r: number[]) => r.length;
  const two = (a: number, b: number) => a + b;
  return [
    (count as (...a: number[]) => number)(1, 2, 3),
    (sum as (...a: number[]) => number)(1, 2, 3),
    withDefault.length,
    rest.length,
    two.length,
  ].map(String);
}

// 14
export function p14KeyOrder(): string[] {
  const o = { b: 1, 2: 'x', a: 2, 1: 'y' };
  return [Object.keys(o).join(), String(Object.keys({ [Symbol('s')]: 1 }).length)];
}

// 15
export function p15Sort(): string[] {
  const arr = [3, 1, 2];
  const sorted = arr.toSorted();
  const same = [1, 2, 3];
  return [
    [10, 9, 1].sort().join(),
    ['B', 'a', 'C'].sort().join(),
    [3, 1, 2].sort((a, b) => b - a).join(),
    `${sorted.join()}|${arr.join()}`,
    String(same.sort() === same),
  ];
}

// 16
export function p16Numbers(): string[] {
  return [
    ['1', '2', '3'].map(parseInt).join(),
    String(0.1 + 0.2),
    String(0.1 + 0.2 === 0.3),
    String(Math.max()),
    String(2 ** 53 + 1),
  ];
}

// 17
export function p17References(): string[] {
  const log: string[] = [];
  const x = {};
  const y = {};
  log.push(String(x === y));
  const a = { v: 1 };
  const b = a;
  b.v = 2;
  log.push(String(a.v));
  const orig = { n: { x: 1 } };
  const deep = structuredClone(orig);
  deep.n.x = 7;
  log.push(String(orig.n.x));
  const shallow = { ...orig };
  shallow.n.x = 99;
  log.push(String(orig.n.x));
  return log;
}

// 18
export function p18SameValueZero(): string[] {
  return [
    [NaN].includes(NaN),
    [NaN].indexOf(NaN),
    new Set([NaN, NaN]).size,
    new Set([0, -0]).size,
    new Map([[{}, 1]]).get({}),
  ].map(String);
}

// 19
export function p19Finally(): string[] {
  const log: string[] = [];
  function f(): string {
    try {
      return 'try';
    } finally {
      log.push('f:finally ran');
    }
  }
  function g(): string {
    try {
      throw new Error('x');
    } catch {
      return 'catch';
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return 'finally';
    }
  }
  log.push(f());
  log.push(g());
  return log;
}

// 20 (async)
export async function p20PromisePassThrough(): Promise<string[]> {
  const log: string[] = [];
  void Promise.resolve(1)
    // @ts-expect-error a non-function .then handler is ignored at runtime
    .then(2)
    .then((v) => log.push(String(v)));
  void Promise.reject(new Error('e'))
    .catch(() => 'recovered')
    .then((v) => log.push(v));
  void Promise.resolve('v')
    .finally(() => 'ignored')
    .then((v) => log.push(v));
  await tick();
  return log;
}

// 21
export function p21ClassBinding(): string[] {
  class Legacy {
    label = 'legacy';
    bound: () => string;
    constructor() {
      this.bound = this.plain.bind(this); // the class-component constructor ritual
    }
    plain(): string {
      return this.label;
    }
    arrow = (): string => this.label;
  }
  const l = new Legacy();
  const { plain } = l;
  return [
    attempt(plain as () => string),
    l.bound(),
    l.arrow(),
    String(l.plain.bind(l) === l.plain.bind(l)),
    String(l.bound === l.bound),
  ];
}

// 22
export function p22DefaultsAndNullish(): string[] {
  const { a = 1, b = 2, c = 3 } = { a: undefined as number | undefined, b: null as number | null, c: 0 };
  const maybe = {} as { x?: { y: number } };
  const zero = Number('0'); // a literal 0 would make TS reject `0 ?? 'x'`
  return [
    String(a),
    String(b),
    String(c),
    String(zero || 'x'),
    String(zero ?? 'x'),
    String(maybe.x?.y),
  ];
}

// 23
export function p23Generator(): string[] {
  const log: string[] = [];
  function* g(): Generator<number, void, string> {
    log.push('start');
    const x = yield 1;
    log.push(`got ${x}`);
    yield 2;
    log.push('end');
  }
  const it = g();
  log.push('created');
  it.next('ignored');
  it.next('hello');
  it.next('');
  return log;
}

// 24
export function p24ArrayHoles(): string[] {
  return [
    String(Array(3).map((_, i) => i).length),
    JSON.stringify(Array(3).map((_, i) => i)),
    Array.from({ length: 3 }, (_, i) => i).join(),
    [...Array(3).keys()].join(),
  ];
}

// 25 (async)
export async function p25ForEachVsForOf(): Promise<string[]> {
  const log: string[] = [];
  [1, 2].forEach(async (n) => {
    await null;
    log.push(`forEach ${n}`);
  });
  log.push('after forEach');
  for (const n of [1, 2]) {
    await null;
    log.push(`for-of ${n}`);
  }
  log.push('done');
  await tick();
  return log;
}

// 26
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
  }
}
export function p26ErrorCause(): string[] {
  const log: string[] = [];
  try {
    try {
      throw new Error('boom');
    } catch (cause) {
      throw new HttpError(502, 'bad gateway', { cause });
    }
  } catch (e) {
    if (e instanceof HttpError) {
      log.push(String(e instanceof Error), e.name, e.message, (e.cause as Error).message, String(e.status));
    }
  }
  return log;
}
