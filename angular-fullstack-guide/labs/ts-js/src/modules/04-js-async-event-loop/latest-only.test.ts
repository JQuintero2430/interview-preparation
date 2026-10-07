import { latestOnly } from './latest-only';

/** A fake search whose calls stay pending until the test settles them, in any order. */
function controllableSearch() {
  const calls: { query: string; signal: AbortSignal; deferred: PromiseWithResolvers<string[]> }[] = [];
  const search = (signal: AbortSignal, query: string): Promise<string[]> => {
    const deferred = Promise.withResolvers<string[]>();
    calls.push({ query, signal, deferred });
    return deferred.promise;
  };
  const call = (index: number) => {
    const found = calls[index];
    if (!found) throw new Error(`call ${index} was never made`);
    return found;
  };
  return { search, calls, call };
}

describe('E04.4 latestOnly', () => {
  it('forwards the arguments and gives every call a fresh, unaborted signal', () => {
    const { search, calls } = controllableSearch();
    const latestSearch = latestOnly(search);
    void latestSearch('an').catch(() => undefined);
    void latestSearch('ang');
    expect(calls.map((c) => c.query)).toEqual(['an', 'ang']);
    expect(calls[0]?.signal).not.toBe(calls[1]?.signal);
    expect(calls[1]?.signal.aborted).toBe(false);
  });

  it('aborts the previous call’s signal with an AbortError DOMException', () => {
    const { search, call } = controllableSearch();
    const latestSearch = latestOnly(search);
    void latestSearch('an').catch(() => undefined);
    void latestSearch('ang');
    const { signal } = call(0);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBeInstanceOf(DOMException);
    expect((signal.reason as DOMException).name).toBe('AbortError');
  });

  it('rejects a superseded call immediately, even if its work resolves later (no stale result)', async () => {
    const { search, call } = controllableSearch();
    const latestSearch = latestOnly(search);
    const first = latestSearch('an').catch((error: unknown) => error);
    const second = latestSearch('ang');
    const firstOutcome = await first; // settles before the slow first response arrives
    call(0).deferred.resolve(['stale']);
    call(1).deferred.resolve(['angular']);
    expect((firstOutcome as DOMException).name).toBe('AbortError');
    expect(await second).toEqual(['angular']);
  });

  it('settles the latest call with its own value or its own error', async () => {
    const { search, call } = controllableSearch();
    const latestSearch = latestOnly(search);
    const ok = latestSearch('ng');
    call(0).deferred.resolve(['ngrx']);
    expect(await ok).toEqual(['ngrx']);

    const failing = latestSearch('rx');
    const networkError = new Error('network down');
    call(1).deferred.reject(networkError);
    await expect(failing).rejects.toBe(networkError);
  });
});
