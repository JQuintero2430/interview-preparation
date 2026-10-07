// Behavioral claims made in the prose of module 03 that are not Output questions.
// Each test is named after its section or question.

function errorName(run: () => unknown): string | undefined {
  try {
    run();
  } catch (e) {
    return (e as { name?: string }).name;
  }
  return undefined;
}

describe('03 · section claims', () => {
  it('§1 seal allows writes but not adds or deletes; preventExtensions still allows deletes', () => {
    const sealed: Record<string, number> = Object.seal({ a: 1 });
    sealed['a'] = 2;
    expect(sealed['a']).toBe(2);
    expect(() => {
      sealed['b'] = 1;
    }).toThrow(TypeError);
    expect(() => {
      delete sealed['a'];
    }).toThrow(TypeError);

    const closed: Record<string, number> = Object.preventExtensions({ a: 1 });
    delete closed['a'];
    expect('a' in closed).toBe(false);
    expect(() => {
      closed['b'] = 1;
    }).toThrow(TypeError);
  });

  it('§1 an accessor property computes on read and validates on write', () => {
    class Temperature {
      #celsius = 0;
      get fahrenheit(): number {
        return this.#celsius * 1.8 + 32;
      }
      set fahrenheit(value: number) {
        if (!Number.isFinite(value)) throw new RangeError('not a finite number');
        this.#celsius = (value - 32) / 1.8;
      }
    }
    const t = new Temperature();
    t.fahrenheit = 32;
    expect(t.fahrenheit).toBe(32);
    expect(() => {
      t.fahrenheit = Number.NaN;
    }).toThrow(RangeError);
    expect(Object.keys(t)).toEqual([]);
  });

  it('Q03.03 prototype, __proto__ and Object.getPrototypeOf', () => {
    function Point(this: { x: number }, x: number): void {
      this.x = x;
    }
    const p: unknown = Reflect.construct(Point, [1]);
    expect(Object.getPrototypeOf(p)).toBe(Point.prototype);
    expect(Point.prototype.constructor).toBe(Point);
    expect(Object.getPrototypeOf(Point)).toBe(Function.prototype);
    const bare: { __proto__?: unknown } = Object.create(null);
    expect(bare.__proto__).toBeUndefined();
    expect(Object.getPrototypeOf(bare)).toBeNull();
  });

  it('Q03.07 a naive recursive merge lets "__proto__" pollute Object.prototype', () => {
    type Bag = Record<string, unknown>;
    const isBag = (value: unknown): value is Bag => typeof value === 'object' && value !== null;
    function naiveMerge(target: Bag, source: Bag): Bag {
      for (const [key, value] of Object.entries(source)) {
        if (isBag(value)) naiveMerge((target[key] ??= {}) as Bag, value);
        else target[key] = value;
      }
      return target;
    }
    const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);
    function safeMerge(target: Bag, source: Bag): Bag {
      for (const [key, value] of Object.entries(source)) {
        if (FORBIDDEN.has(key)) continue;
        if (isBag(value)) {
          const existing = Object.hasOwn(target, key) ? target[key] : undefined;
          safeMerge(isBag(existing) ? existing : ((target[key] = {}) as Bag), value); // replace a primitive or null
        } else target[key] = value;
      }
      return target;
    }
    expect(safeMerge({ theme: 'dark' }, { theme: { mode: 'light' } })).toEqual({ theme: { mode: 'light' } });
    expect(safeMerge({ theme: null }, { theme: { mode: 'light' } })).toEqual({ theme: { mode: 'light' } });
    expect(safeMerge({ theme: { mode: 'dark', size: 2 } }, { theme: { mode: 'light' } })).toEqual({ theme: { mode: 'light', size: 2 } });
    const payload: Bag = JSON.parse('{"__proto__": {"polluted": true}}');
    expect(Object.hasOwn(payload, '__proto__')).toBe(true);
    try {
      safeMerge({}, payload);
      expect(({} as Bag)['polluted']).toBeUndefined();
      naiveMerge({}, payload);
      expect(({} as Bag)['polluted']).toBe(true);
    } finally {
      delete (Object.prototype as Bag)['polluted'];
    }
  });

  it('§3 an ES5 Error subclass gets no message, no stack and no error brand', () => {
    function MyError(this: object, message: string): void {
      Error.call(this, message); // returns a new Error and ignores `this`
    }
    MyError.prototype = Object.create(Error.prototype);
    const error = new (MyError as unknown as new (message: string) => Error)('disk full');
    expect(error.message).toBe(''); // inherited from Error.prototype
    expect(Object.hasOwn(error, 'stack')).toBe(false);
    expect(Object.prototype.toString.call(error)).toBe('[object Object]');
    expect(error instanceof Error).toBe(true);
  });

  it('§3 class fields use define semantics, not inherited setters', () => {
    const setterCalls: number[] = [];
    class Base {
      set value(next: number) {
        setterCalls.push(next);
      }
    }
    class Derived extends Base {
      // @ts-expect-error a field over an inherited accessor is what this test is about
      value = 1;
    }
    const derived = new Derived();
    expect(setterCalls).toEqual([]);
    expect(Object.getOwnPropertyDescriptor(derived, 'value')).toEqual({ value: 1, writable: true, enumerable: true, configurable: true });
  });

  it('§3 a derived class\'s fields are initialized after super() returns', () => {
    const seenByBase: unknown[] = [];
    class Base {
      constructor() {
        seenByBase.push(this.describe()); // calls the override before Derived's fields exist
      }
      describe(): string {
        return 'base';
      }
    }
    class Derived extends Base {
      label = 'derived';
      override describe(): string {
        return this.label;
      }
    }
    const derived = new Derived();
    expect(seenByBase).toEqual([undefined]);
    expect(derived.describe()).toBe('derived');
  });

  it('§3 class X extends null cannot be constructed', () => {
    class X extends null {}
    expect(Object.getPrototypeOf(X.prototype)).toBeNull();
    expect(() => new X()).toThrow(new TypeError('Super constructor null of X is not a constructor'));
  });

  it('§3 extends links two chains: instances and constructors', () => {
    class Base {
      static create(): string {
        return 'created';
      }
    }
    class Derived extends Base {}
    expect(Object.getPrototypeOf(Derived.prototype)).toBe(Base.prototype);
    expect(Object.getPrototypeOf(Derived)).toBe(Base);
    expect(Derived.create()).toBe('created');
  });

  it('§3 a static block runs once, when the class is evaluated', () => {
    const order: string[] = [];
    class Registry {
      static readonly entries = new Map<string, number>();
      static {
        order.push('static block');
        Registry.entries.set('default', 0);
      }
    }
    order.push('after class');
    expect(order).toEqual(['static block', 'after class']);
    expect(Registry.entries.get('default')).toBe(0);
  });

  it('§4 a subclass that counts add() misses the items the Set constructor added', () => {
    class CountingSet<T> extends Set<T> {
      added = 0;
      override add(value: T): this {
        this.added++;
        return super.add(value);
      }
    }
    const tags = new CountingSet(['a', 'b', 'c']);
    expect(tags.size).toBe(3);
    expect(tags.added).toBe(0); // the constructor called add() 3 times, then the field reset the count
    tags.add('d');
    expect(tags.added).toBe(1);
  });

  it('§4 a class-expression mixin adds behavior and keeps instanceof for the base', () => {
    // A mixin's constructor type must take `...args: any[]` (TS2545), the one place `any` is required.
    type Constructor<T = object> = new (...args: any[]) => T;
    function Timestamped<TBase extends Constructor>(Base: TBase) {
      return class extends Base {
        readonly createdAt = new Date(0);
      };
    }
    class Entity {
      constructor(readonly id: string) {}
    }
    const TimestampedEntity = Timestamped(Entity);
    const e = new TimestampedEntity('42');
    expect(e.id).toBe('42');
    expect(e.createdAt.getTime()).toBe(0);
    expect(e).toBeInstanceOf(Entity);
  });

  it('§5 a Proxy over a Map breaks methods that need internal slots', () => {
    const map = new Map([['a', 1]]);
    const naive = new Proxy(map, {});
    expect(() => naive.get('a')).toThrow(TypeError);
    const bound = new Proxy(map, {
      get(target, key) {
        const value: unknown = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    expect(bound.get('a')).toBe(1);
    expect(bound.size).toBe(1);
  });

  it('§5 a revoked Proxy throws on every operation', () => {
    const { proxy, revoke } = Proxy.revocable<{ a: number }>({ a: 1 }, {});
    expect(proxy.a).toBe(1);
    revoke();
    expect(() => proxy.a).toThrow(TypeError);
    expect(() => {
      proxy.a = 2;
    }).toThrow(TypeError);
    expect(() => 'a' in proxy).toThrow(TypeError);
    expect(() => Object.keys(proxy)).toThrow(TypeError);
  });

  it('§5 a Proxy over Date and Promise breaks slot methods', () => {
    const date = new Proxy(new Date(0), {});
    expect(() => date.getTime()).toThrow(TypeError);
    const promise = new Proxy(Promise.resolve(1), {});
    expect(() => promise.then(() => undefined)).toThrow(TypeError);
  });

  it('§8 a plain object is not iterable', () => {
    const settings = { theme: 'dark' };
    expect(() => {
      // @ts-expect-error TypeScript rejects it too, which is the point
      for (const entry of settings) void entry;
    }).toThrow(TypeError);
    expect([...Object.entries(settings)]).toEqual([['theme', 'dark']]);
  });

  it('§6 JSON round-trip traps', () => {
    expect(JSON.stringify({ a: undefined, b: Number.NaN, c: [undefined], d: new Map([[1, 2]]) })).toBe(
      '{"b":null,"c":[null],"d":{}}',
    );
    expect(() => JSON.stringify({ n: 1n })).toThrow(TypeError);
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(() => JSON.stringify(cyclic)).toThrow(TypeError);
  });

  it('§6 structuredClone keeps cycles, Map and Set, and rejects proxies and symbols', () => {
    const cyclic: { self?: unknown; tags: Set<string> } = { tags: new Set(['x']) };
    cyclic.self = cyclic;
    const copy = structuredClone(cyclic);
    expect(copy.self).toBe(copy);
    expect(copy.tags).toEqual(new Set(['x']));
    expect(copy.tags).not.toBe(cyclic.tags);
    expect(errorName(() => structuredClone(new Proxy({}, {})))).toBe('DataCloneError');
    expect(errorName(() => structuredClone({ s: Symbol('s') }))).toBe('DataCloneError');
  });
});
