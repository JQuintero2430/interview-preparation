// Output questions for module 03, section 5 (Proxy and Reflect).
import { captureLogs } from '../capture';

describe('03 · Proxy and Reflect', () => {
  it('Q03.12 a get trap without the receiver misses reads made inside getters', async () => {
    const lines = await captureLogs((log) => {
      const user = {
        first: 'Ada',
        last: 'Lovelace',
        get full(): string {
          return `${this.first} ${this.last}`;
        },
      };
      const naive = new Proxy(user, {
        get(target, key) {
          log(`get ${String(key)}`);
          return target[key as keyof typeof target];
        },
      });
      log(naive.full);
      const correct = new Proxy(user, {
        get(target, key, receiver) {
          log(`get ${String(key)}`);
          return Reflect.get(target, key, receiver);
        },
      });
      log(correct.full);
    });
    expect(lines).toEqual(['get full', 'Ada Lovelace', 'get full', 'get first', 'get last', 'Ada Lovelace']);
  });

  it('Q03.13 proxy invariants and a set trap that returns false', async () => {
    const lines = await captureLogs((log) => {
      const target: { id?: number; other?: number } = {};
      Object.defineProperty(target, 'id', { value: 1 }); // non-writable, non-configurable
      const lying = new Proxy(target, { get: () => 2 });
      log(lying.other);
      try {
        log(lying.id);
      } catch (e) {
        log(e instanceof TypeError);
      }
      const readOnly = new Proxy({ x: 1 }, { set: () => false });
      try {
        readOnly.x = 5;
      } catch (e) {
        log(e instanceof TypeError);
      }
      log(readOnly.x);
    });
    expect(lines).toEqual(['2', 'true', 'true', '1']);
  });
});
