import { MonoTypeOperatorFunction, Observable, OperatorFunction, fromEvent, of, takeUntil } from 'rxjs';
import { ProbeSource } from './probe-source';
import { takeUntilAbort, tapFirst, withPrevious } from './operators';

function record<T>(source: Observable<T>, log: string[]) {
  return source.subscribe({
    next: (v) => log.push(JSON.stringify(v) ?? 'undefined'),
    error: (e: unknown) => log.push(`error ${e}`),
    complete: () => log.push('complete'),
  });
}

/** Counts the abort listeners an operator adds to and removes from one signal. */
function listenerCounts(signal: AbortSignal) {
  const added = vi.spyOn(signal, 'addEventListener');
  const removed = vi.spyOn(signal, 'removeEventListener');
  return () => ({ added: added.mock.calls.length, removed: removed.mock.calls.length });
}

describe('E22.3 Write three custom operators', () => {
  it('tapFirst(fn) calls fn once with the first value and forwards every notification unchanged', () => {
    const probe = new ProbeSource<number>();
    const firsts: number[] = [];
    const log: string[] = [];

    record(probe.source.pipe(tapFirst((v) => firsts.push(v))), log);
    [1, 2, 3].forEach((v) => probe.next(v));
    probe.complete();

    expect(firsts).toEqual([1]);
    expect(log).toEqual(['1', '2', '3', 'complete']);
  });

  it('withPrevious() emits [previous, current] with undefined for the first value and keeps its state per subscription (two subscribers each start at undefined)', () => {
    const probe = new ProbeSource<number>();
    const paired = probe.source.pipe(withPrevious());
    const a: Array<[number | undefined, number]> = [];
    const b: Array<[number | undefined, number]> = [];

    paired.subscribe((pair) => a.push(pair));
    probe.next(1);
    probe.next(2);
    paired.subscribe((pair) => b.push(pair));
    probe.next(3);

    expect(a).toEqual([[undefined, 1], [1, 2], [2, 3]]);
    expect(b).toEqual([[undefined, 3]]);
  });

  it('takeUntilAbort(signal) completes when the signal aborts, completes at once for an already-aborted signal, and removes its listener on complete and on unsubscribe', () => {
    const ending = (end: (probe: ProbeSource<number>, controller: AbortController, unsubscribe: () => void) => void) => {
      const probe = new ProbeSource<number>();
      const controller = new AbortController();
      const counts = listenerCounts(controller.signal);
      const log: string[] = [];
      const subscription = record(probe.source.pipe(takeUntilAbort(controller.signal)), log);
      probe.next(1);
      end(probe, controller, () => subscription.unsubscribe());
      probe.next(2);
      return { log, ...counts(), teardowns: probe.teardowns };
    };

    expect(ending((_, controller) => controller.abort())).toEqual({ log: ['1', 'complete'], added: 1, removed: 1, teardowns: 1 });
    expect(ending((probe) => probe.complete())).toEqual({ log: ['1', 'complete'], added: 1, removed: 1, teardowns: 1 });
    expect(ending((_, __, unsubscribe) => unsubscribe())).toEqual({ log: ['1'], added: 1, removed: 1, teardowns: 1 });

    const probe = new ProbeSource<number>();
    const signal = AbortSignal.abort();
    const counts = listenerCounts(signal);
    const log: string[] = [];
    record(probe.source.pipe(takeUntilAbort(signal)), log);
    expect(log).toEqual(['complete']);
    expect(probe.subscriptions).toBe(0);
    expect(counts()).toEqual({ added: 0, removed: 0 });

    // The composed alternative misses an abort that already happened: no complete, the source stays subscribed.
    const composed = new ProbeSource<number>();
    const composedLog: string[] = [];
    const open = record(composed.source.pipe(takeUntil(fromEvent(signal, 'abort'))), composedLog);
    expect(composedLog).toEqual([]);
    expect([composed.subscriptions, composed.teardowns]).toEqual([1, 0]);
    open.unsubscribe();
  });

  it('every operator forwards error and complete and unsubscribes the source when the consumer unsubscribes (probe teardown count 1)', () => {
    const operators: Array<OperatorFunction<number, unknown>> = [
      tapFirst(() => undefined),
      withPrevious(),
      takeUntilAbort(new AbortController().signal),
    ];

    for (const operator of operators) {
      const failing = new ProbeSource<number>();
      const finishing = new ProbeSource<number>();
      const leaving = new ProbeSource<number>();
      const log: string[] = [];
      record(failing.source.pipe(operator), log);
      record(finishing.source.pipe(operator), log);
      const subscription = record(leaving.source.pipe(operator), log);

      failing.error('boom');
      finishing.complete();
      subscription.unsubscribe();

      expect(log).toEqual(['error boom', 'complete']);
      expect([failing.teardowns, finishing.teardowns, leaving.teardowns]).toEqual([1, 1, 1]);
    }
  });

  it('the operators are lazy: nothing happens until subscribe', () => {
    const probe = new ProbeSource<number>();
    const controller = new AbortController();
    const counts = listenerCounts(controller.signal);
    const firsts: number[] = [];

    const piped = probe.source.pipe(tapFirst((v) => firsts.push(v)), withPrevious(), takeUntilAbort(controller.signal));
    probe.next(1);

    expect([probe.subscriptions, firsts.length, counts().added]).toEqual([0, 0, 0]);
    piped.subscribe();
    expect([probe.subscriptions, counts().added]).toEqual([1, 1]);
  });

  it('the signatures type-check (OperatorFunction/MonoTypeOperatorFunction, a @ts-expect-error for a wrong element type)', () => {
    const pairs: OperatorFunction<string, [string | undefined, string]> = withPrevious<string>();
    const first: MonoTypeOperatorFunction<string> = tapFirst((v: string) => v.toUpperCase());
    const log: string[] = [];

    record(of('a', 'b').pipe(first, pairs), log);
    // @ts-expect-error tapFirst expects numbers here, the source emits strings
    of('a').pipe(tapFirst((v: number) => v.toFixed()));

    expect(log).toEqual(['[null,"a"]', '["a","b"]', 'complete']);
  });
});
