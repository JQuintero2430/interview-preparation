import { TestBed } from '@angular/core/testing';
import { SwUpdate, provideServiceWorker } from '@angular/service-worker';

describe('Section 4: the update service without a browser worker', () => {
  it('Section 4: SwUpdate reports isEnabled false where the browser has no service worker', () => {
    TestBed.configureTestingModule({ providers: [provideServiceWorker('ngsw-worker.js', { enabled: true })] });

    expect('serviceWorker' in navigator).toBe(false);
    expect(TestBed.inject(SwUpdate).isEnabled).toBe(false);
  });
});
