// Output questions for module 03, section 3 (classes: sugar and what is not sugar).
import { captureLogs } from '../capture';

describe('03 · classes', () => {
  it('Q03.08 class methods are non-enumerable and a class cannot be called', async () => {
    const lines = await captureLogs((log) => {
      class A {
        m(): void {}
      }
      function B(): void {}
      B.prototype.m = function (): void {};
      log(Object.keys(A.prototype).length, Object.keys(B.prototype).length);
      try {
        // @ts-expect-error a class constructor cannot be invoked without 'new'
        A();
      } catch (e) {
        log(e instanceof TypeError);
      }
      log(typeof A);
    });
    expect(lines).toEqual(['0 1', 'true', 'function']);
  });

  it('Q03.09 private fields: brand checks, proxies and serialization', async () => {
    const lines = await captureLogs((log) => {
      class Counter {
        #count = 0;
        inc(): number {
          return ++this.#count;
        }
        static isCounter(o: object): boolean {
          return #count in o;
        }
      }
      const c = new Counter();
      const p = new Proxy(c, {});
      log(c.inc(), Counter.isCounter(c), Counter.isCounter(p));
      try {
        p.inc();
      } catch (e) {
        log(e instanceof TypeError);
      }
      log(Object.keys(c).length, JSON.stringify(c));
    });
    expect(lines).toEqual(['1 true false', 'true', '0 {}']);
  });

  it('Q03.10 super is resolved through the home object, not through this', async () => {
    const lines = await captureLogs((log) => {
      class Animal {
        describe(): string {
          return 'animal';
        }
      }
      class Dog extends Animal {
        override describe(): string {
          return `dog > ${super.describe()}`;
        }
      }
      class Robot {
        describe(): string {
          return 'robot';
        }
      }
      const r = new Robot();
      r.describe = Dog.prototype.describe;
      log(r.describe());
    });
    expect(lines).toEqual(['dog > animal']);
  });
});
