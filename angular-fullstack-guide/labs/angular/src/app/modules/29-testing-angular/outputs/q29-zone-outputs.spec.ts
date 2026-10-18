import 'zone.js';
import 'zone.js/testing';
// Zone half of Q29.30. zone.js is imported for this file only, so the other specs stay zoneless.
import { fakeAsync, waitForAsync } from '@angular/core/testing';

const FAKE_ASYNC_MISSING =
  'zone-testing.js is needed for the fakeAsync() test helper but could not be found.\n' +
  `${' '.repeat(8)}Please make sure that your environment includes zone.js/testing`;
const PROXY_ZONE_MISSING = "Expected to be running in 'ProxyZone', but it was not found.";

describe('Q29 zone outputs', () => {
  it('Q29.30 with zone.js imported in the spec fakeAsync still throws the zone-testing.js error and waitForAsync rejects with the ProxyZone error', async () => {
    expect(typeof Reflect.get(globalThis, 'Zone')).toBe('function');
    expect(() => fakeAsync(() => {})()).toThrow(FAKE_ASYNC_MISSING);

    // The typings declare one parameter (done: any), so the call passes undefined.
    const reason: unknown = await waitForAsync(() => {})(undefined).then(
      () => 'resolved',
      (error: unknown) => error,
    );

    expect(reason).toBeInstanceOf(Error);
    expect(reason instanceof Error ? reason.message : '').toBe(PROXY_ZONE_MISSING);
  });
});
