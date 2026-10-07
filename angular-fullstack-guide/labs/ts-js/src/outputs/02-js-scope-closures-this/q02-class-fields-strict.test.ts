import { captureLogs } from '../capture';

const LEAKED_GLOBAL = 'q02LeakedGlobal';

describe('Module 02 outputs: arrow class fields and strict mode', () => {
  it('Q02.16 an arrow class field survives detaching; a prototype method does not', async () => {
    const lines = await captureLogs((log) => {
      class Ticker {
        label = 'ticker';
        arrowTick = () => this.label;
        methodTick() {
          return this?.label;
        }
      }
      const t = new Ticker();
      const { arrowTick, methodTick } = t;
      log(arrowTick());
      log(methodTick());
      log(Object.hasOwn(t, 'arrowTick'), Object.hasOwn(t, 'methodTick'));
      const other = new Ticker();
      log(other.arrowTick === t.arrowTick, other.methodTick === t.methodTick);
    });

    expect(lines).toEqual(['ticker', 'undefined', 'true false', 'false true']);
  });

  it('Q02.17 sloppy and strict functions see a different this and handle undeclared assignments differently', async () => {
    const lines = await captureLogs((log) => {
      const sloppyThis = new Function('return this');
      const strictThis = new Function('"use strict"; return this');
      log(sloppyThis() === globalThis, strictThis());
      log(typeof sloppyThis.call(5), typeof strictThis.call(5));

      new Function(`${LEAKED_GLOBAL} = 1`)();
      log(Reflect.get(globalThis, LEAKED_GLOBAL));
      Reflect.deleteProperty(globalThis, LEAKED_GLOBAL);

      try {
        new Function(`"use strict"; ${LEAKED_GLOBAL} = 1`)();
      } catch (error) {
        log(error instanceof ReferenceError, Reflect.has(globalThis, LEAKED_GLOBAL));
      }
    });

    expect(lines).toEqual(['true undefined', 'object number', '1', 'true false']);
  });
});
