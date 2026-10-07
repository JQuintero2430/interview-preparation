import { deepFreeze } from './deep-freeze';

describe('E03.1 deepFreeze', () => {
  it('freezes nested objects and arrays', () => {
    const config = deepFreeze({ db: { hosts: ['a', 'b'], pool: { max: 5 } } });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.db)).toBe(true);
    expect(Object.isFrozen(config.db.hosts)).toBe(true);
    expect(Object.isFrozen(config.db.pool)).toBe(true);
  });

  it('returns the same reference and passes primitives through', () => {
    const original = { a: 1 };
    expect(deepFreeze(original)).toBe(original);
    expect(deepFreeze(5)).toBe(5);
    expect(deepFreeze(null)).toBeNull();
  });

  it('handles cycles', () => {
    const node: { name: string; self?: unknown } = { name: 'root' };
    node.self = node;
    expect(() => deepFreeze(node)).not.toThrow();
    expect(Object.isFrozen(node)).toBe(true);
  });

  it('descends into children of an object that was already frozen', () => {
    const inner = { n: 1 };
    const outer = Object.freeze({ inner });
    deepFreeze(outer);
    expect(Object.isFrozen(inner)).toBe(true);
  });

  it('does not invoke getters', () => {
    let calls = 0;
    const obj = {
      get expensive(): number {
        calls++;
        return 1;
      },
    };
    deepFreeze(obj);
    expect(calls).toBe(0);
  });

  it('rejects writes at compile time and at run time', () => {
    const config = deepFreeze({ db: { hosts: ['a'] } });
    expect(() => {
      // @ts-expect-error nested properties are readonly
      config.db.hosts = [];
    }).toThrow(TypeError);
    expect(() => {
      // @ts-expect-error nested arrays are readonly arrays
      config.db.hosts.push('b');
    }).toThrow(TypeError);
  });

  it('leaves Map contents mutable (documented limitation)', () => {
    const state = deepFreeze({ cache: new Map<string, number>() });
    state.cache.set('k', 1);
    expect(state.cache.get('k')).toBe(1);
  });

  it('a frozen class instance keeps its #private state writable', () => {
    class Counter {
      #count = 0;
      increment(): number {
        return ++this.#count;
      }
    }
    const counter = Object.freeze(new Counter());
    counter.increment();
    expect(counter.increment()).toBe(2);
    expect(Object.isFrozen(counter)).toBe(true);
  });
});
