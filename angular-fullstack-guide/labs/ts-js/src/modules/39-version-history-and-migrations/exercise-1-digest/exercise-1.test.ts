// Exercise 39.1: five criteria, each run over both digest loops (our code modeled on AngularJS 1.8.3, not run against it).
import { TTL } from './scope';
import type { Scope } from './scope';
import { createScope as createA } from './a/digest-scope';
import { createScope as createB } from './b/digest-scope';

type CreateScope = <M extends object>(model: M) => Scope<M>;

describe.each<[string, CreateScope]>([
  ['a (a full pass per loop)', createA],
  ['b (a dirty set fed by setters)', createB],
])('Exercise 39.1 · digest loop %s', (_variant, createScope) => {
  it('calls a listener once when its watched value changes during apply', () => {
    const scope = createScope({ name: 'ada' });
    const calls: [string, string][] = [];
    scope.watch('name', (value, previous) => calls.push([value, previous]));
    scope.digest();
    expect(calls).toEqual([['ada', 'ada']]);

    calls.length = 0;
    scope.apply(() => {
      scope.model.name = 'grace';
    });
    expect(calls).toEqual([['grace', 'ada']]);
  });

  it('runs another loop when a listener changes a value another watcher reads', () => {
    const scope = createScope({ a: 1, b: 0 });
    const seenB: number[] = [];
    scope.watch('b', (value) => seenB.push(value));
    scope.watch('a', (value) => {
      scope.model.b = value * 2;
    });
    scope.digest();
    expect(scope.model.b).toBe(2);

    seenB.length = 0;
    const passes = scope.apply(() => {
      scope.model.a = 5;
    });
    expect(seenB).toEqual([10]);
    expect(passes).toBe(3);
  });

  it('throws an infdig error after ten unstable loops', () => {
    const scope = createScope({ tick: 0 });
    let calls = 0;
    scope.watch('tick', () => {
      calls++;
      scope.model.tick++;
    });
    expect(() => scope.digest()).toThrow('10 $digest() iterations reached. Aborting!');
    expect(calls).toBe(TTL + 1);
  });

  it('runs queued evalAsync work before the loop ends', () => {
    const scope = createScope({ a: 0, b: 0 });
    const log: string[] = [];
    scope.watch('b', (value) => log.push(`b=${value}`));
    scope.watch('a', () => {
      log.push('a');
      scope.evalAsync(() => {
        log.push('async');
        scope.model.b = 7;
      });
    });
    const passes = scope.digest();
    expect(log).toEqual(['b=0', 'a', 'async', 'b=7']);
    expect(passes).toBe(3);
  });

  it('stops calling a listener after its watcher is deregistered', () => {
    const scope = createScope({ name: 'ada' });
    const seen: string[] = [];
    const stop = scope.watch('name', (value) => seen.push(value));
    scope.digest();
    scope.apply(() => {
      scope.model.name = 'linus';
    });
    expect(seen).toEqual(['ada', 'linus']);

    stop();
    scope.apply(() => {
      scope.model.name = 'grace';
    });
    expect(seen).toEqual(['ada', 'linus']);
  });
});
