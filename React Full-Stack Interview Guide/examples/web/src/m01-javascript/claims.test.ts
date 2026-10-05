/* Executable checks for version- and semantics-specific claims made in 01-javascript.md.
 * Each test name says which claim it backs. */
import * as live from './liveBinding';
import { count, increment } from './liveBinding';

const g = globalThis as unknown as Record<string, unknown>;

describe('ES2023 non-mutating array methods', () => {
  test('toSorted, toReversed, with and toSpliced return copies', () => {
    const a = [3, 1, 2];
    expect(a.toSorted()).toEqual([1, 2, 3]);
    expect(a.toReversed()).toEqual([2, 1, 3]);
    expect(a.with(0, 9)).toEqual([9, 1, 2]);
    expect(a.toSpliced(1, 1)).toEqual([3, 2]);
    expect(a).toEqual([3, 1, 2]);
  });

  test('findLast / findLastIndex (ES2023)', () => {
    expect([1, 2, 3, 4].findLast((n) => n % 2 === 1)).toBe(3);
    expect([1, 2, 3, 4].findLastIndex((n) => n > 9)).toBe(-1);
  });

  test('sort is stable (ES2019)', () => {
    const people = [
      { n: 'a', age: 30 },
      { n: 'b', age: 20 },
      { n: 'c', age: 30 },
      { n: 'd', age: 20 },
    ];
    expect(people.sort((x, y) => x.age - y.age).map((p) => p.n)).toEqual(['b', 'd', 'a', 'c']);
  });
});

describe('newer features exist at runtime on Node 24 (not in the ES2023 type lib)', () => {
  test('ES2024: Object.groupBy, Map.groupBy, Promise.withResolvers', () => {
    expect(typeof (g.Object as { groupBy?: unknown }).groupBy).toBe('function');
    expect(typeof (g.Map as { groupBy?: unknown }).groupBy).toBe('function');
    expect(typeof (g.Promise as { withResolvers?: unknown }).withResolvers).toBe('function');
  });

  test('ES2025: Set methods and iterator helpers', () => {
    const setProto = (g.Set as { prototype: Record<string, unknown> }).prototype;
    for (const name of ['union', 'intersection', 'difference', 'symmetricDifference', 'isSubsetOf']) {
      expect(typeof setProto[name]).toBe('function');
    }
    const iteratorProto = (g.Iterator as { prototype: Record<string, unknown> }).prototype;
    for (const name of ['map', 'filter', 'take', 'drop', 'flatMap', 'reduce', 'toArray']) {
      expect(typeof iteratorProto[name]).toBe('function');
    }
  });

  test('Object.groupBy returns a null-prototype object', () => {
    const groupBy = (g.Object as unknown as {
      groupBy: <T>(items: T[], fn: (t: T) => string) => Record<string, T[]>;
    }).groupBy;
    const grouped = groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even'));
    expect(grouped).toEqual({ odd: [1, 3], even: [2, 4] });
    expect(Object.getPrototypeOf(grouped)).toBeNull();
  });
});

describe('structuredClone and its limits', () => {
  test('keeps Date, Map, Set, cycles and undefined values', () => {
    const original: { d: Date; m: Map<string, number>; s: Set<number>; u: undefined; self?: unknown } = {
      d: new Date(0),
      m: new Map([['k', 1]]),
      s: new Set([1]),
      u: undefined,
    };
    original.self = original;
    const copy = structuredClone(original);
    expect(copy.d).toBeInstanceOf(Date);
    expect(copy.m.get('k')).toBe(1);
    expect(copy.s.has(1)).toBe(true);
    expect('u' in copy).toBe(true);
    expect(copy.self).toBe(copy);
  });

  test('throws DataCloneError for functions', () => {
    let name = '';
    try {
      structuredClone({ fn: () => 1 });
    } catch (e) {
      name = (e as Error).name;
    }
    expect(name).toBe('DataCloneError');
  });

  test('drops the prototype: class instances become plain objects', () => {
    class Point {
      x = 1;
      double() {
        return this.x * 2;
      }
    }
    const copy = structuredClone(new Point());
    expect(copy.x).toBe(1);
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
    expect((copy as unknown as { double?: unknown }).double).toBeUndefined();
  });

  test('drops symbol keys, evaluates getters into plain values', () => {
    const sym = Symbol('s');
    const source = {
      [sym]: 1,
      get computed() {
        return 42;
      },
    };
    const copy = structuredClone(source) as Record<PropertyKey, unknown>;
    expect(copy[sym]).toBeUndefined();
    expect(Object.getOwnPropertyDescriptor(copy, 'computed')?.value).toBe(42);
  });

  test('JSON round-trip loses more', () => {
    const copy = JSON.parse(
      JSON.stringify({ d: new Date(0), u: undefined, n: NaN, m: new Map([[1, 2]]), f: () => 1 }),
    ) as Record<string, unknown>;
    expect(copy).toEqual({ d: '1970-01-01T00:00:00.000Z', n: null, m: {} });
  });
});

describe('errors', () => {
  test('Error cause (ES2022)', () => {
    const inner = new Error('inner');
    const outer = new Error('outer', { cause: inner });
    expect(outer.cause).toBe(inner);
    expect(Object.keys(outer)).not.toContain('cause'); // own but non-enumerable
  });

  test('Promise.any rejects with an AggregateError', async () => {
    const result = await Promise.any([Promise.reject(new Error('a')), Promise.reject(new Error('b'))]).catch(
      (e: unknown) => e,
    );
    expect(result).toBeInstanceOf(AggregateError);
    expect((result as AggregateError).errors).toHaveLength(2);
  });

  test('allSettled never rejects and reports each outcome', async () => {
    const out = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('x'))]);
    expect(out.map((r) => r.status)).toEqual(['fulfilled', 'rejected']);
  });

  test('reduce without an initial value throws on an empty array', () => {
    expect(() => ([] as number[]).reduce((a, b) => a + b)).toThrow(TypeError);
    expect([].reduce((a: number, b: number) => a + b, 0)).toBe(0);
  });
});

describe('modules', () => {
  test('ESM exports are live bindings', () => {
    expect(count).toBe(0);
    increment();
    expect(count).toBe(1); // the importer sees the updated value
    expect(live.count).toBe(1);
  });

  test('dynamic import() returns a promise of the same module namespace', async () => {
    const ns = await import('./liveBinding');
    expect(ns.count).toBe(live.count);
    expect(ns.increment).toBe(increment);
  });
});

describe('classes and prototypes', () => {
  test('class is syntax over prototypes; calling it without new throws', () => {
    class Animal {
      speak() {
        return 'noise';
      }
    }
    class Dog extends Animal {}
    expect(typeof Animal).toBe('function');
    expect(Object.getPrototypeOf(Dog.prototype)).toBe(Animal.prototype);
    expect(Object.getPrototypeOf(Dog)).toBe(Animal); // static inheritance
    expect(new Dog().speak()).toBe('noise');
    expect(() => (Animal as unknown as () => void)()).toThrow(TypeError);
  });

  test('methods live on the prototype, fields on each instance', () => {
    class A {
      field = () => 1;
      method() {
        return 1;
      }
    }
    const a1 = new A();
    const a2 = new A();
    expect(a1.method).toBe(a2.method);
    expect(a1.field).not.toBe(a2.field);
  });

  test('#private fields are real privacy, unlike a TS private modifier', () => {
    class Secret {
      #x = 1;
      private y = 2;
      peek() {
        return this.#x + this.y;
      }
    }
    const s = new Secret();
    expect(Object.keys(s)).toEqual(['y']); // #x is invisible; y is an ordinary property
    expect(s.peek()).toBe(3);
  });
});

describe('numbers and weak references', () => {
  test('floating point', () => {
    expect(0.1 + 0.2 === 0.3).toBe(false);
    expect(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON).toBe(true);
    expect(Number.MAX_SAFE_INTEGER).toBe(2 ** 53 - 1);
  });

  test('WeakRef.deref returns the target while it is still strongly held', () => {
    const target = { id: 1 };
    const ref = new WeakRef(target);
    expect(ref.deref()).toBe(target);
  });

  test('WeakMap accepts only objects as keys', () => {
    const wm = new WeakMap<object, number>();
    const key = {};
    wm.set(key, 1);
    expect(wm.get(key)).toBe(1);
    expect(() => (wm as unknown as WeakMap<never, number>).set(1 as never, 1)).toThrow(TypeError);
  });
});

describe('iterators and generators', () => {
  test('generators are lazy and return() runs finally', () => {
    const log: string[] = [];
    function* gen() {
      try {
        yield 1;
        yield 2;
      } finally {
        log.push('cleanup');
      }
    }
    for (const n of gen()) {
      if (n === 1) break; // break calls return() on the iterator
    }
    expect(log).toEqual(['cleanup']);
  });

  test('a hand-written iterable works with spread and for...of', () => {
    const range = {
      from: 1,
      to: 3,
      [Symbol.iterator](): Iterator<number> {
        let n = this.from;
        const to = this.to;
        return { next: () => (n <= to ? { value: n++, done: false as const } : { value: undefined, done: true as const }) };
      },
    };
    expect([...range]).toEqual([1, 2, 3]);
  });
});
