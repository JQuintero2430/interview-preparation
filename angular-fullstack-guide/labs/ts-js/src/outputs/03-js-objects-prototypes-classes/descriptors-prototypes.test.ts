// Output questions for module 03, sections 1 (descriptors) and 2 (prototype chain), and the
// evidence for the Q03.07a trade-off.
// Test modules are ES modules, so every snippet runs in strict mode, as it would in an app.
import { captureLogs } from '../capture';

describe('03 · descriptors and the prototype chain', () => {
  it('Q03.01 defineProperty defaults every flag to false', async () => {
    const lines = await captureLogs((log) => {
      const o: { x?: number } = {};
      Object.defineProperty(o, 'x', { value: 1 });
      log(Object.keys(o).length, JSON.stringify(o));
      try {
        o.x = 2;
      } catch (e) {
        log(e instanceof TypeError);
      }
      log(o.x);
    });
    expect(lines).toEqual(['0 {}', 'true', '1']);
  });

  it('Q03.02 Object.freeze is shallow', async () => {
    const lines = await captureLogs((log) => {
      const config = Object.freeze({ retries: 3, endpoints: ['a'] });
      try {
        // @ts-expect-error retries is readonly in the type returned by Object.freeze
        config.retries = 5;
      } catch (e) {
        log((e as Error).constructor.name);
      }
      config.endpoints.push('b');
      log(config.retries, config.endpoints.length, Object.isFrozen(config), Object.isFrozen(config.endpoints));
    });
    expect(lines).toEqual(['TypeError', '3 2 true false']);
  });

  it('Q03.04 lookup walks the chain; an own property shadows an inherited one', async () => {
    const lines = await captureLogs((log) => {
      const base = {
        name: 'base',
        greet(): string {
          return `hi ${this.name}`;
        },
      };
      const child: { name?: string; greet(): string } = Object.create(base);
      child.name = 'child';
      log(child.greet());
      log(Object.hasOwn(child, 'greet'), 'greet' in child);
      delete child.name;
      log(child.greet());
    });
    expect(lines).toEqual(['hi child', 'false true', 'hi base']);
  });

  it('Q03.05 a mutable object on the prototype is shared by every instance', async () => {
    const lines = await captureLogs((log) => {
      const defaults = { tags: [] as string[] };
      const a = Object.create(defaults) as typeof defaults;
      const b = Object.create(defaults) as typeof defaults;
      a.tags.push('urgent');
      b.tags.push('later');
      log(a.tags.join(), b.tags === a.tags, Object.hasOwn(a, 'tags'));
      a.tags = ['own'];
      log(a.tags.join(), b.tags.join());
    });
    expect(lines).toEqual(['urgent,later true false', 'own urgent,later']);
  });

  it('Q03.06 an inherited read-only property blocks assignment (the override mistake)', async () => {
    const lines = await captureLogs((log) => {
      const proto = Object.freeze({ kind: 'base' });
      const obj: { kind: string } = Object.create(proto);
      try {
        obj.kind = 'own';
      } catch (e) {
        log(e instanceof TypeError);
      }
      log(obj.kind, Object.hasOwn(obj, 'kind'));
      Object.defineProperty(obj, 'kind', { value: 'own', writable: true, enumerable: true, configurable: true });
      log(obj.kind, Object.hasOwn(obj, 'kind'));
    });
    expect(lines).toEqual(['true', 'base false', 'own true']);
  });

  it('Q03.07a dictionaries: key order, inherited keys, __proto__ and JSON', async () => {
    const lines = await captureLogs((log) => {
      const obj: Record<string, number> = { b: 1, 2: 1, a: 1, 1: 1 };
      const map = new Map<string | number, number>([['b', 1], [2, 1], ['a', 1], [1, 1]]);
      log(Object.keys(obj).join(), [...map.keys()].join());
      log('toString' in {}, 'toString' in Object.create(null));
      const plain: Record<string, unknown> = {};
      plain['__proto__'] = 1;
      const bare: Record<string, unknown> = Object.create(null);
      bare['__proto__'] = 1;
      log(Object.keys(plain).length, Object.keys(bare).join());
      log(JSON.stringify(map), JSON.stringify(Object.fromEntries(map)));
    });
    expect(lines).toEqual(['1,2,b,a b,2,a,1', 'true false', '0 __proto__', '{} {"1":1,"2":1,"b":1,"a":1}']);
  });
});
