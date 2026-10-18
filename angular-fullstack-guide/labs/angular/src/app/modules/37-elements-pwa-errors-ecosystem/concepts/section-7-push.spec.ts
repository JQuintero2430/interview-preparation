import { TestBed } from '@angular/core/testing';
import { SwPush, provideServiceWorker } from '@angular/service-worker';

describe('Section 7: the push service when the worker is off', () => {
  it('Section 7: SwPush reports isEnabled false and requestSubscription rejects without a worker', async () => {
    TestBed.configureTestingModule({ providers: [provideServiceWorker('ngsw-worker.js', { enabled: false })] });
    const push = TestBed.inject(SwPush);

    expect(push.isEnabled).toBe(false);
    await expect(push.requestSubscription({ serverPublicKey: 'AAAA' })).rejects.toThrowError(
      'Service workers are disabled or not supported by this browser',
    );
  });
});
