import { TestBed } from '@angular/core/testing';
import { countPrimes } from '../demo/prime-count';
import { LabM31PrimeService } from '../demo/prime-service';

describe('Section 9: Web Workers', () => {
  it('Section 9: without Worker support the service computes on the main thread', async () => {
    expect(typeof Worker).toBe('undefined');
    const service = TestBed.inject(LabM31PrimeService);

    expect(service.usesWorker).toBe(false);
    expect(await service.count(100)).toBe(25);
    expect(await service.count(1000)).toBe(countPrimes(1000));
    expect(countPrimes(1000)).toBe(168);
  });
});
