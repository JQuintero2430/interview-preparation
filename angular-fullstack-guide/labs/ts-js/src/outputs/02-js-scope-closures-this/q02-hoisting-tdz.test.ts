// @ts-nocheck -- these snippets read variables before their declaration on purpose. TypeScript
// rejects that at compile time (which is its job); the tests check what JavaScript does at run time.
import { captureLogs } from '../capture';

describe('Module 02 outputs: hoisting and the temporal dead zone', () => {
  it('Q02.02 var and function declarations are hoisted differently', async () => {
    const lines = await captureLogs((log) => {
      function snippet() {
        'use strict';
        log(typeof hoisted);
        log(typeof assigned);
        log(value);
        var value = 1;
        var assigned = function () {};
        function hoisted() {}
        log(value, typeof assigned);
      }
      // Built with the Function constructor because Vite's oxc parser wrongly rejects a `var` and a
      // function declaration sharing a name at function top level (ECMA-262 allows it; Node runs it).
      const sameName = new Function(
        'log',
        "'use strict'; log(typeof both); var both = 1; function both() {} log(typeof both);",
      ) as (log: (...args: unknown[]) => void) => void;
      snippet();
      sameName(log);
    });

    expect(lines).toEqual(['function', 'undefined', 'undefined', '1 function', 'function', 'number']);
  });

  it('Q02.03 let is hoisted too, into the temporal dead zone', async () => {
    const lines = await captureLogs((log) => {
      function snippet() {
        'use strict';
        let x = 'outer';
        function inner() {
          try {
            log(x);
          } catch (error) {
            log(error.name);
          }
          let x = 'inner';
          log(x);
        }
        inner();
        log(typeof neverDeclared);
        try {
          log(typeof later);
        } catch (error) {
          log(error.name);
        }
        let later = 1;
        log(x, later);
      }
      snippet();
    });

    expect(lines).toEqual(['ReferenceError', 'inner', 'undefined', 'ReferenceError', 'outer 1']);
  });

  it('Q02.03 (V8 message) names the binding that is still in the dead zone', () => {
    function readTooEarly() {
      'use strict';
      const copy = early;
      let early = 1;
      return copy + early;
    }

    expect(readTooEarly).toThrow(ReferenceError);
    expect(readTooEarly).toThrow("Cannot access 'early' before initialization");
  });

  it('Q02.04 a function declared in a block: block-scoped in strict code, leaked in sloppy code', async () => {
    const lines = await captureLogs((log) => {
      function strictSnippet() {
        'use strict';
        const before = typeof inner;
        {
          function inner() {}
        }
        return `${before} ${typeof inner}`;
      }
      const sloppySnippet = new Function(
        'const before = typeof inner; { function inner() {} } return before + " " + typeof inner;',
      );
      log('strict:', strictSnippet());
      log('sloppy:', sloppySnippet());
    });

    expect(lines).toEqual(['strict: undefined undefined', 'sloppy: undefined function']);
  });

  it('Section 2: class declarations are in the dead zone until evaluated', () => {
    function useBeforeDeclaration() {
      'use strict';
      const instance = new Widget();
      class Widget {}
      return instance;
    }

    expect(useBeforeDeclaration).toThrow(ReferenceError);
  });
});
