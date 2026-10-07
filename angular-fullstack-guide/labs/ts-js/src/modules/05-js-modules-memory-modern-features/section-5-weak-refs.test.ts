// Section 5 claims. The API rules run in Vitest; the collection behavior runs with `node --expose-gc`
// and asserts what Node 24.21 printed on 20 consecutive runs (observed, not guaranteed by the spec).
import { runNode, stdoutLines } from '../../outputs/run-node';

const runWithGc = (path: string) =>
  stdoutLines(runNode(new URL(`./fixtures/section-5/${path}`, import.meta.url), ['--expose-gc']));

describe('Module 05 · section 5: weak references', () => {
  it('Section 5: a WeakMap has no size and cannot be iterated', () => {
    const cache = new WeakMap<object, number>();
    expect('size' in cache).toBe(false);
    expect(Reflect.get(cache, 'keys')).toBeUndefined();
    expect(Reflect.get(cache, Symbol.iterator)).toBeUndefined();
  });

  it('Section 5: keys must be objects or non-registered symbols', () => {
    const cache = new WeakMap<WeakKey, number>();
    expect(() => cache.set(Symbol('local'), 1)).not.toThrow();
    expect(() => cache.set(Symbol.iterator, 2)).not.toThrow();
    expect(() => cache.set(Symbol.for('app'), 3)).toThrow(new TypeError('Invalid value used as weak map key'));
    expect(() => new WeakRef(42 as unknown as object)).toThrow(TypeError);
  });

  it('Section 5: a WeakRef target stays alive for the rest of the current job, then can be collected', () => {
    expect(runWithGc('deref-job.mjs')).toEqual(['same job, after gc: cached', 'next task, after gc: undefined']);
  });

  it('Section 5: a WeakMap value that references its own key does not keep the key alive', () => {
    expect(runWithGc('ephemeron.mjs')).toEqual(['key collected although its value references it: true']);
  });

  it('Section 5: a FinalizationRegistry callback runs in a later task after collection', () => {
    expect(runWithGc('finalization.mjs')).toEqual(['cleanup for session-42', 'after gc and one more task']);
  });
});
