import { flushTasks } from '../../outputs/capture';
import { mapWithConcurrency } from './promise-pool';

/** A mapper whose calls stay pending until the test settles them by index. */
function controllableMapper() {
  const started: number[] = [];
  const pending = new Map<number, PromiseWithResolvers<string>>();
  let inFlight = 0;
  let maxInFlight = 0;
  const mapper = (item: string, index: number): Promise<string> => {
    started.push(index);
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    const deferred = Promise.withResolvers<string>();
    pending.set(index, deferred);
    return deferred.promise.finally(() => {
      inFlight--;
    });
  };
  const settle = (index: number, outcome: { value: string } | { error: Error }): void => {
    const deferred = pending.get(index);
    if (!deferred) throw new Error(`item ${index} was never started`);
    if ('value' in outcome) deferred.resolve(outcome.value);
    else deferred.reject(outcome.error);
  };
  return { mapper, settle, started, getMaxInFlight: () => maxInFlight };
}

describe('E04.2 mapWithConcurrency', () => {
  it('resolves with results in input order even when items finish out of order', async () => {
    const control = controllableMapper();
    const result = mapWithConcurrency(['a', 'b', 'c'], 3, control.mapper);
    control.settle(2, { value: 'C' });
    control.settle(0, { value: 'A' });
    control.settle(1, { value: 'B' });
    expect(await result).toEqual(['A', 'B', 'C']);
  });

  it('never runs more than `limit` calls at once', async () => {
    const control = controllableMapper();
    const result = mapWithConcurrency(['a', 'b', 'c', 'd', 'e'], 2, control.mapper);
    for (let index = 0; index < 5; index++) {
      await flushTasks();
      control.settle(index, { value: String(index) });
    }
    await result;
    expect(control.getMaxInFlight()).toBe(2);
  });

  it('starts the next item as soon as any call settles, not when the whole batch does', async () => {
    const control = controllableMapper();
    const result = mapWithConcurrency(['a', 'b', 'c'], 2, control.mapper);
    expect(control.started).toEqual([0, 1]);
    control.settle(1, { value: 'B' }); // item 0 is still running
    await flushTasks();
    expect(control.started).toEqual([0, 1, 2]);
    control.settle(0, { value: 'A' });
    control.settle(2, { value: 'C' });
    expect(await result).toEqual(['A', 'B', 'C']);
  });

  it('rejects with the first error and starts no new items after it', async () => {
    const control = controllableMapper();
    const result = mapWithConcurrency(['a', 'b', 'c', 'd'], 2, control.mapper);
    const outcome = result.catch((error: unknown) => error);
    const boom = new Error('boom');
    control.settle(1, { error: boom });
    expect(await outcome).toBe(boom);
    control.settle(0, { value: 'A' });
    await flushTasks();
    expect(control.started).toEqual([0, 1]);
  });

  it('resolves with an empty array for no items and rejects an invalid limit with a RangeError', async () => {
    expect(await mapWithConcurrency<string, string>([], 3, async (item: string) => item)).toEqual([]);
    await expect(mapWithConcurrency(['a'], 0, async (item: string) => item)).rejects.toBeInstanceOf(RangeError);
    await expect(mapWithConcurrency(['a'], 1.5, async (item: string) => item)).rejects.toBeInstanceOf(RangeError);
  });
});
