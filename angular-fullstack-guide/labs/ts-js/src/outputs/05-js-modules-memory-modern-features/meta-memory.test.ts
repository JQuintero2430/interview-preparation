// Q05.08–Q05.14. Module and GC behavior runs in a real node process; the lazy loader runs in Vitest.
import { lazy } from './lazy';
import { runNode, stdoutLines } from '../run-node';

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url);

describe('Module 05 · Output questions: import.meta, memory and weak references', () => {
  it('Q05.08 lazy() shares one in-flight load between callers', async () => {
    let loads = 0;
    const loadFeature = lazy(async () => ({ id: ++loads }));
    const [first, second] = await Promise.all([loadFeature(), loadFeature()]);
    expect([first, second, loads]).toEqual([{ id: 1 }, { id: 1 }, 1]);
    expect(await loadFeature()).toBe(first);
  });

  it('Q05.08 lazy() does not cache a failure, so the next call retries', async () => {
    let attempts = 0;
    const loadFeature = lazy(async () => {
      attempts += 1;
      if (attempts === 1) throw new TypeError('Failed to fetch dynamically imported module');
      return 'loaded';
    });
    await expect(loadFeature()).rejects.toThrow(TypeError);
    expect([await loadFeature(), attempts]).toEqual(['loaded', 2]);
  });

  it('Q05.08 lazy() works with a real import(), which returns the same namespace each time', async () => {
    const loadSelf = lazy(() => import('./lazy'));
    const namespace = await loadSelf();
    expect(namespace.lazy).toBe(lazy);
  });

  it('Q05.10 a JSON module has one default export, import() needs the attribute too, and import.meta.dirname matches the URL', () => {
    expect(stdoutLines(runNode(fixture('q05-10/main.mjs')))).toEqual([
      "dark true [ 'default' ]",
      'true',
      'ERR_IMPORT_ATTRIBUTE_MISSING',
    ]);
  });

  it('Q05.14 a WeakRef target survives gc() in its own job, and the process may exit before finalization runs', () => {
    expect(stdoutLines(runNode(fixture('q05-14/main.mjs'), ['--expose-gc']))).toEqual([
      'same job: config',
      'later task: undefined',
    ]);
  });
});
