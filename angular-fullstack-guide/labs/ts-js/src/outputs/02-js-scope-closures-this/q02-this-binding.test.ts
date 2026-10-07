// @ts-nocheck -- these snippets use untyped `this`, the comma operator and `new` on bound
// functions on purpose. TypeScript flags several of them; the tests check JavaScript's run-time rules.
import { captureLogs } from '../capture';

describe('Module 02 outputs: this binding', () => {
  it('Q02.11 a method loses its this when the reference is detached from the object', async () => {
    const lines = await captureLogs((log) => {
      function snippet() {
        'use strict';
        const counter = {
          count: 0,
          increment() {
            this.count++;
            return this.count;
          },
        };
        log(counter.increment());
        const detached = counter.increment;
        try {
          detached();
        } catch (error) {
          log(error.name);
        }
        log((counter.increment)());
        try {
          (0, counter.increment)();
        } catch (error) {
          log(error.name);
        }
        log(counter.increment.bind(counter)());
      }
      snippet();
    });

    expect(lines).toEqual(['1', 'TypeError', '2', 'TypeError', '3']);
  });

  it('Q02.12 arrow functions take this from where they are written', async () => {
    const lines = await captureLogs((log) => {
      function makeObject() {
        'use strict';
        return {
          name: 'inner',
          regular() {
            return this.name;
          },
          arrow: () => this.name,
          viaArrowCallback() {
            return [0].map(() => this.name)[0];
          },
          viaRegularCallback() {
            return [0].map(function () {
              return this?.name;
            })[0];
          },
        };
      }
      const obj = makeObject.call({ name: 'outer' });
      log(obj.regular());
      log(obj.arrow());
      log(obj.viaArrowCallback());
      log(obj.viaRegularCallback());
      log(obj.arrow.call({ name: 'explicit' }));
    });

    expect(lines).toEqual(['inner', 'outer', 'inner', 'undefined', 'outer']);
  });

  it('Q02.13 binding precedence: new beats bind, and bind beats call and implicit binding', async () => {
    const lines = await captureLogs((log) => {
      function snippet() {
        'use strict';
        function whoAmI() {
          return this.name;
        }
        const a = { name: 'a' };
        const b = { name: 'b' };
        const boundToA = whoAmI.bind(a);
        log(boundToA.call(b));
        log(boundToA.bind(b)());
        const holder = { name: 'holder', who: boundToA };
        log(holder.who());

        function Person(name) {
          this.name = name;
        }
        const BoundPerson = Person.bind(a);
        const p = new BoundPerson('p');
        log(p.name, a.name, p instanceof Person);
      }
      snippet();
    });

    expect(lines).toEqual(['a', 'a', 'a', 'p a true']);
  });

  it('Section 4: arrow functions cannot be called with new and have no own arguments', () => {
    function outer() {
      'use strict';
      const arrow = () => arguments[0];
      return arrow('ignored');
    }
    const arrow = () => 1;

    expect(outer('from outer')).toBe('from outer');
    expect(() => new arrow()).toThrow(TypeError);
    expect(Object.hasOwn(arrow, 'prototype')).toBe(false);
  });
});
