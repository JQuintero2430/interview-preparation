import { captureLogs, flushTasks } from '../capture';

describe('Module 02 outputs: closures', () => {
  it('Q02.06 the loop-closure bug: var shares one binding, let gets one per iteration', async () => {
    const lines = await captureLogs(async (log) => {
      for (var i = 0; i < 3; i++) {
        setTimeout(() => log('var', i), 0);
      }
      for (let j = 0; j < 3; j++) {
        setTimeout(() => log('let', j), 0);
      }
      await flushTasks();
    });

    expect(lines).toEqual(['var 3', 'var 3', 'var 3', 'let 0', 'let 1', 'let 2']);
  });

  it('Q02.07 closures capture variables, not values', async () => {
    const lines = await captureLogs((log) => {
      function makeCounter() {
        let count = 0;
        return {
          increment: () => ++count,
          current: () => count,
        };
      }
      const a = makeCounter();
      const b = makeCounter();
      a.increment();
      a.increment();
      b.increment();
      log(a.current(), b.current());

      let greeting = 'hello';
      const greet = () => greeting;
      greeting = 'goodbye';
      log(greet());

      const handlers: Array<() => number> = [];
      let shared = 0;
      for (const step of [1, 2, 3]) {
        shared += step;
        handlers.push(() => shared * 10 + step);
      }
      log(handlers.map((handler) => handler()).join(' '));
    });

    expect(lines).toEqual(['2 1', 'goodbye', '61 62 63']);
  });

  it('Section 1: lookup follows where code is written, and blocks fence let but not var', () => {
    // The section's snippet, with the module scope replaced by this test's function scope.
    const level = 'module';
    function readLevel(): string {
      return level; // resolved by where readLevel is written
    }
    function caller(): string {
      const level = 'caller'; // shadows the outer level, but readLevel never sees it
      return readLevel();
    }
    function blocks(): string {
      if (true) {
        var functionScoped = 1;
        let blockScoped = 2;
      }
      // @ts-expect-error blockScoped is out of scope here, which is the point
      return typeof functionScoped + ' ' + typeof blockScoped;
    }

    expect(caller()).toBe('module');
    expect(blocks()).toBe('number undefined');
  });

  it('Q02.20 once(): one run with the caller\'s this, a throwing first call can be retried, re-entry runs again', () => {
    function once<T, A extends unknown[], R>(fn: (this: T, ...args: A) => R): (this: T, ...args: A) => R {
      let done = false;
      let result: R;
      return function (this: T, ...args: A): R {
        if (!done) {
          result = fn.apply(this, args);
          done = true; // set after the call: a throwing first call can be retried
        }
        return result;
      };
    }

    let runs = 0;
    const sdk = {
      name: 'sdk',
      init: once(function (this: { name: string }, version: number) {
        runs += 1;
        return `${this.name} v${version}`;
      }),
    };
    expect([sdk.init(1), sdk.init(2), runs]).toEqual(['sdk v1', 'sdk v1', 1]);

    let attempts = 0;
    const connect = once(() => {
      attempts += 1;
      if (attempts === 1) throw new Error('down');
      return 'connected';
    });
    expect(() => connect()).toThrow('down');
    expect([connect(), connect(), attempts]).toEqual(['connected', 'connected', 2]);

    let entries = 0;
    const reentrant: () => number = once(() => {
      entries += 1;
      if (entries < 3) reentrant(); // calls itself while the first run is still in progress
      return entries;
    });
    expect([reentrant(), entries]).toEqual([3, 3]);
  });

  it('Q02.21 classic scripts share one global scope; only var and function declarations become global object properties', async () => {
    const vmSpecifier = 'node:vm'; // a variable, so the typecheck does not need Node's type declarations
    const vm = (await import(vmSpecifier)) as {
      createContext: (sandbox: object) => object;
      runInContext: (code: string, context: object) => unknown;
    };
    const page = vm.createContext({}); // one realm, like one page; each runInContext call is one classic script
    vm.runInContext('var legacy = 1; let modern = 2;', page);

    expect(vm.runInContext('[typeof globalThis.legacy, typeof globalThis.modern, modern]', page)).toEqual([
      'number',
      'undefined',
      2,
    ]);
    expect(() => vm.runInContext('let modern = 3;', page)).toThrow("Identifier 'modern' has already been declared");
  });
});
