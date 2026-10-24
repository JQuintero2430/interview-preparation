// Section 8 claims, about our model (flag-model.ts), not OpenFeature's or Nginx's code: a user's bucket depends only
// on the flag key and the targeting key, so the assignment is stable and different flags split users independently; a
// 10% rollout reaches 10% of a fixed list of 10,000 keys within one point; a failed evaluation returns the caller's
// default value with reason ERROR and an error code; and a canary router serves a tab's HTML and chunks from one
// release only when it is sticky. No clock, network or random source: keys are numbered strings.
import {
  answer,
  bucketOf,
  evaluate,
  route,
  withOldChunks,
  type FlagDefinition,
  type Release,
} from './flag-model';

const KEYS = Array.from({ length: 10_000 }, (_, index) => `user-${index}`);

const CHECKOUT: FlagDefinition = {
  variants: { old: false, new: true },
  defaultVariant: 'old',
  rollout: { percent: 10, variant: 'new' },
};

const FILES: Record<Release, ReadonlySet<string>> = {
  v1: new Set(['index.html', 'main-AAAAAAAA.js', 'chunk-OLDOLD01.js']),
  v2: new Set(['index.html', 'main-BBBBBBBB.js', 'chunk-NEWNEW02.js']),
};
const CHUNK: Record<Release, string> = { v1: 'chunk-OLDOLD01.js', v2: 'chunk-NEWNEW02.js' };

describe('Module 44 · section 8', () => {
  it('Section 8: the same targeting key always lands in the same bucket', () => {
    const first = KEYS.slice(0, 100).map((key) => bucketOf('new-checkout', key));
    const again = KEYS.slice(0, 100).map((key) => bucketOf('new-checkout', key));
    expect(again).toEqual(first);
    for (const bucket of first) {
      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThan(10_000);
    }
    // The flag key is part of the hash: the same users get other buckets for another flag, so 10% here is not the same
    // 10% there.
    const other = KEYS.slice(0, 100).map((key) => bucketOf('dark-mode', key));
    expect(other).not.toEqual(first);
  });

  it('Section 8: a 10% rollout serves the new variant to 10% of 10,000 keys within one point', () => {
    const flags = { 'new-checkout': CHECKOUT };
    const served = KEYS.filter(
      (key) => evaluate(flags, true, 'new-checkout', false, { targetingKey: key }).variant === 'new',
    );
    expect(Math.abs(served.length - 1_000)).toBeLessThanOrEqual(100);
    // Asking again gives every key the same variant: a user does not flip between loads.
    const again = KEYS.filter(
      (key) => evaluate(flags, true, 'new-checkout', false, { targetingKey: key }).variant === 'new',
    );
    expect(again).toEqual(served);
    // The kill switch: a disabled flag gives every key the caller's default value and the reason DISABLED.
    const off = { 'new-checkout': { ...CHECKOUT, disabled: true } };
    const details = evaluate(off, true, 'new-checkout', false, { targetingKey: served[0] });
    expect(details).toEqual({ flagKey: 'new-checkout', value: false, reason: 'DISABLED' });
  });

  it('Section 8: an evaluation error returns the default value with an error reason', () => {
    const flags = { 'new-checkout': CHECKOUT };
    expect(evaluate(flags, false, 'new-checkout', false, { targetingKey: 'ana' })).toEqual({
      flagKey: 'new-checkout',
      value: false,
      reason: 'ERROR',
      errorCode: 'PROVIDER_NOT_READY',
    });
    expect(evaluate(flags, true, 'missing', true, { targetingKey: 'ana' })).toEqual({
      flagKey: 'missing',
      value: true,
      reason: 'ERROR',
      errorCode: 'FLAG_NOT_FOUND',
    });
    // Before login there is no targeting key, and a percentage rollout needs one.
    expect(evaluate(flags, true, 'new-checkout', false, {})).toEqual({
      flagKey: 'new-checkout',
      value: false,
      reason: 'ERROR',
      errorCode: 'TARGETING_KEY_MISSING',
    });
  });

  it('Section 8: a sticky canary cookie serves index.html and its chunks from the same release', () => {
    for (let index = 0; index < 200; index++) {
      const clientId = `client-${index}`;
      const page = route({ clientId, requestId: `index-${index}` }, 50, true);
      expect(page.setCookie).toBe(page.release);
      // The browser sends the cookie back, and the canary share has changed in the meantime.
      const chunk = route({ clientId, requestId: `chunk-${index}`, cookie: page.setCookie }, 0, true);
      expect(chunk.release).toBe(page.release);
      expect(answer(FILES, chunk.release, CHUNK[page.release])).toBe(200);
    }
  });

  it('Section 8: without stickiness a tab can load index.html from one release and a chunk from another', () => {
    const skewed = Array.from({ length: 200 }, (_, index) => index).filter((index) => {
      const page = route({ clientId: 'client-7', requestId: `index-${index}` }, 50, false);
      const chunk = route({ clientId: 'client-7', requestId: `chunk-${index}` }, 50, false);
      return page.release === 'v2' && chunk.release === 'v1';
    });
    expect(skewed.length).toBeGreaterThan(0);
    // v2's page asks for v2's chunk, and v1's server does not hold it.
    expect(answer(FILES, 'v1', CHUNK.v2)).toBe(404);
    // A tab on v1 asks for v1's chunk after v2 is deployed: it is a 404 unless v2 kept the old files.
    expect(answer({ v1: FILES.v1, v2: FILES.v2 }, 'v2', CHUNK.v1)).toBe(404);
    const kept = { v1: FILES.v1, v2: withOldChunks(FILES.v2, FILES.v1) };
    expect(answer(kept, 'v2', CHUNK.v1)).toBe(200);
  });
});
