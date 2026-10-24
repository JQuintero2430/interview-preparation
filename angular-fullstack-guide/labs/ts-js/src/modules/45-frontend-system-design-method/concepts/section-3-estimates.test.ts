// Section 3 claims, about our model (estimate.ts), not Lighthouse: the two profiles carry the values read from
// lighthouse@13.5.0 and @paulirish/trace_engine@0.0.65; round trips dominate small responses and bytes dominate large
// ones; a saved round trip is worth one round-trip time; the estimate is linear.
import { PROFILES, transferTime } from './estimate';

const { mobileSlow4G: mobile, desktopDense4G: desktop } = PROFILES;
const KB = 1024;
const MB = 1024 * 1024;

describe('Section 3: back-of-envelope estimate (our model)', () => {
  it('Section 3: our profiles carry the round trip and throughput read from Lighthouse 13.5.0', () => {
    expect(mobile).toEqual({ name: 'mobileSlow4G', rttMs: 150, throughputKbps: 1638.4 });
    expect(desktop).toEqual({ name: 'desktopDense4G', rttMs: 40, throughputKbps: 10240 });
  });

  it('Section 3: on the mobile profile, round trips dominate a 20 KB response and bytes dominate a 2 MB one', () => {
    const small = transferTime(mobile, 20 * KB, 2);
    const smallTransfer = transferTime(mobile, 20 * KB, 0);
    expect(small - smallTransfer).toBe(300);
    expect(smallTransfer).toBeCloseTo(97.66, 2);
    const large = transferTime(mobile, 2 * MB, 2);
    expect(large - 300).toBeCloseTo(10000, 6);
  });

  it('Section 3: one fewer round trip saves 150 ms on the mobile profile and 40 ms on the desktop one', () => {
    for (const bytes of [0, 20 * KB, 2 * MB]) {
      expect(transferTime(mobile, bytes, 3) - transferTime(mobile, bytes, 2)).toBeCloseTo(150, 6);
      expect(transferTime(desktop, bytes, 3) - transferTime(desktop, bytes, 2)).toBeCloseTo(40, 6);
    }
  });

  it('Section 3: the estimate is linear in bytes and in round trips', () => {
    const base = transferTime(mobile, 100 * KB, 3);
    expect(transferTime(mobile, 200 * KB, 6)).toBeCloseTo(2 * base, 6);
    expect(transferTime(mobile, 0, 0)).toBe(0);
  });
});
