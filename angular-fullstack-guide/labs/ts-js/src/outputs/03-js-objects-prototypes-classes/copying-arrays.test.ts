// Output questions for module 03, sections 6 (copying) and 7 (change-by-copy array methods).
import { captureLogs } from '../capture';

describe('03 · copying and immutable array methods', () => {
  it('Q03.15 spread vs JSON round-trip vs structuredClone', async () => {
    const lines = await captureLogs((log) => {
      const original = { tags: ['a'], when: new Date(0), meta: undefined };
      const spread = { ...original };
      const json = JSON.parse(JSON.stringify(original));
      const clone = structuredClone(original);
      original.tags.push('b');
      log(spread.tags.length, json.tags.length, clone.tags.length);
      log(typeof json.when, clone.when instanceof Date, 'meta' in json, 'meta' in clone);
    });
    expect(lines).toEqual(['2 1 1', 'string true false true']);
  });

  it('Q03.16 what structuredClone drops and what it refuses', async () => {
    const lines = await captureLogs((log) => {
      class Money {
        #cents: number;
        currency = 'EUR';
        constructor(cents: number) {
          this.#cents = cents;
        }
        get cents(): number {
          return this.#cents;
        }
      }
      const copy = structuredClone(new Money(500));
      log(copy instanceof Money, JSON.stringify(copy), copy.cents);
      try {
        structuredClone({ onClick() {} });
      } catch (e) {
        log((e as DOMException).name);
      }
    });
    expect(lines).toEqual(['false {"currency":"EUR"} undefined', 'DataCloneError']);
  });

  it('Q03.17 toSorted, with, toSpliced and toReversed', async () => {
    const lines = await captureLogs((log) => {
      const scores = [3, 1, 2];
      log(scores.toSorted().join(), scores.with(0, 9).join(), scores.toSpliced(1, 1).join(), scores.join());
      log([10, 9, 1].toSorted().join());
      const sparse = [1, , 3];
      const reversed = sparse.toReversed();
      log(reversed.join('|'), 1 in reversed, 1 in sparse);
      try {
        scores.with(5, 0);
      } catch (e) {
        log(e instanceof RangeError);
      }
    });
    expect(lines).toEqual(['1,2,3 9,1,2 3,2 3,1,2', '1,10,9', '3||1 true false', 'true']);
  });
});
