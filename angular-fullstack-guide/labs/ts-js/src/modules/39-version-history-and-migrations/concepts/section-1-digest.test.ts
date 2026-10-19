// Section 1 claims about our model of the 1.8.3 digest loop (mini-digest.ts); AngularJS itself is not run.
import { MiniScope, TTL } from './mini-digest';

describe('Module 39 · section 1', () => {
  it('Section 1: our model runs a second loop when a listener changes another watched value', () => {
    const model = { a: 1, b: 0 };
    const seenB: unknown[] = [];
    const scope = new MiniScope();
    scope.watch(() => model.b, (value) => seenB.push(value));
    scope.watch(() => model.a, (value) => {
      model.b = Number(value) * 2;
    });
    scope.digest();
    expect(model.b).toBe(2);

    const independent = new MiniScope();
    independent.watch(() => model.a, () => undefined);
    independent.digest();
    expect(independent.apply(() => { model.a = 5; })).toBe(2);

    seenB.length = 0;
    expect(scope.apply(() => { model.a = 5; })).toBe(3);
    expect(seenB).toEqual([10]);
  });

  it('Section 1: our model stops after 10 unstable loops with an infdig-style error', () => {
    let reads = 0;
    const scope = new MiniScope();
    scope.watch(() => reads++, () => undefined);
    expect(() => scope.digest()).toThrow('10 $digest() iterations reached. Aborting!');
    expect(TTL).toBe(10);
    expect(reads).toBe(TTL + 1);
  });

  it('Section 1: our model does not see a change made outside apply until the next digest', () => {
    const model = { name: 'ada' };
    const seen: unknown[] = [];
    const scope = new MiniScope();
    scope.watch(() => model.name, (value) => seen.push(value));
    scope.digest();
    model.name = 'grace';
    expect(seen).toEqual(['ada']);
    scope.apply(() => undefined);
    expect(seen).toEqual(['ada', 'grace']);
  });
});
