// Output question Q45.07: our estimator (concepts/estimate.ts, our model, not Lighthouse's code) on the task board's
// first screen. The sizes are assumptions of the module (section 3): index.html 4 KB, then main.js 180 KB and
// styles.css 20 KB in parallel, then GET /api/boards/42 30 KB; three round trips on the critical path.
import { PROFILES, transferTime } from '../../modules/45-frontend-system-design-method/concepts/estimate';
import { captureLogs } from '../capture';

const KB = 1024;

describe('45 · Q45.07', () => {
  it('Q45.07 our estimate of the first screen on the mobile and desktop profiles', async () => {
    const bytes = (4 + 180 + 20 + 30) * KB;
    const roundTrips = 3;
    const lines = await captureLogs((log) => {
      for (const profile of [PROFILES.mobileSlow4G, PROFILES.desktopDense4G]) {
        const ms = Math.round(transferTime(profile, bytes, roundTrips));
        log(`${profile.name}: ${bytes} bytes, ${roundTrips} round trips, ${ms} ms`);
      }
    });
    expect(lines).toEqual([
      'mobileSlow4G: 239616 bytes, 3 round trips, 1593 ms',
      'desktopDense4G: 239616 bytes, 3 round trips, 303 ms',
    ]);
  });
});
