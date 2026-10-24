// Section 6 claims, about our model (budget.ts), not Lighthouse: the budget is the target minus round trips and server
// time, times the profile's bytes per millisecond; fixed costs can use the whole target; a faster profile allows more.
import { maxBytes } from './budget';
import { PROFILES } from './estimate';

const { mobileSlow4G: mobile, desktopDense4G: desktop } = PROFILES;

describe('Section 6: performance budget (our model)', () => {
  it('Section 6: our budget gives the bytes left after round trips and server time on the mobile profile', () => {
    // 2,500 ms - 3 x 150 ms - 200 ms = 1,850 ms of transfer at 209.7152 bytes per ms
    expect(maxBytes(2500, mobile, 3, 200)).toBeCloseTo(387973.12, 2);
  });

  it('Section 6: a target that round trips alone exceed leaves no byte budget', () => {
    expect(maxBytes(400, mobile, 3, 0)).toBe(0);
  });

  it('Section 6: the desktop profile allows more bytes than the mobile one for the same target', () => {
    expect(maxBytes(2500, desktop, 3, 200)).toBeGreaterThan(maxBytes(2500, mobile, 3, 200));
  });
});
