import { TestBed } from '@angular/core/testing';
import { SwUpdate, provideServiceWorker } from '@angular/service-worker';

describe('Section 6: the update service when the worker is off', () => {
  it('Section 6: checkForUpdate rejects when service workers are disabled', async () => {
    TestBed.configureTestingModule({ providers: [provideServiceWorker('ngsw-worker.js', { enabled: false })] });
    const updates = TestBed.inject(SwUpdate);

    expect(updates.isEnabled).toBe(false);
    await expect(updates.checkForUpdate()).rejects.toThrowError('Service workers are disabled or not supported by this browser');
  });
});
