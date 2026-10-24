// Exercise 45.1: six criteria, each run over both variants (a: memoized depth-first search; b: Kahn's topological
// order). Pure functions over plain data: no network, no clock. The expected times come from concepts/estimate.ts's
// transferTime (our section 3 model, M45 F5), so the test checks the wiring, not a second copy of the formula.
import { PROFILES, transferTime } from '../concepts/estimate';
import { estimateScreen as estimateA } from './a/estimate-screen';
import { estimateScreen as estimateB } from './b/estimate-screen';
import { mergeRequests, type RequestSpec, type ScreenSpec } from './screen';

const { mobileSlow4G: mobile, desktopDense4G: desktop } = PROFILES;
const request = (id: string, bytes: number, ...dependsOn: string[]): RequestSpec => ({ id, bytes, dependsOn });

function messageOf(action: () => unknown): string {
  try {
    action();
    return '';
  } catch (error) {
    return error instanceof Error ? error.message : '';
  }
}

// Assumed first screen of the task board (section 3, Q45.07): KB means 1,000 bytes; 234,000 bytes in all.
const board: ScreenSpec = {
  serverMs: 100,
  requests: [request('html', 4000), request('js', 180000, 'html'), request('css', 20000, 'html'), request('api', 30000, 'js')],
};

describe.each(['a', 'b'])('Exercise 45.1, variant %s', (variant) => {
  const estimate = variant === 'a' ? estimateA : estimateB;

  it('returns the longest dependency chain as the critical path and counts parallel requests once', () => {
    const verdict = estimate(board, { targetMs: 1000 });
    expect(verdict.criticalPath).toEqual(['html', 'js', 'api']);
    expect(verdict.roundTrips).toBe(3);
    const fan: ScreenSpec = { serverMs: 0, requests: [request('page', 1), ...['a', 'b', 'c', 'd'].map((id) => request(id, 1, 'page'))] };
    expect(estimate(fan, { targetMs: 1000 }).roundTrips).toBe(2);
  });

  it("computes each profile's time with our estimator from the critical path's round trips, the screen's total bytes and the server time", () => {
    const verdict = estimate(board, { targetMs: 1000 });
    expect(verdict.totalBytes).toBe(234000);
    expect(verdict.timeMs[mobile.name]).toBeCloseTo(transferTime(mobile, 234000, 3) + 100, 6);
    expect(verdict.timeMs[desktop.name]).toBeCloseTo(transferTime(desktop, 234000, 3) + 100, 6);
  });

  it('rejects a dependency cycle with an error that names the requests in it', () => {
    const cyclic: ScreenSpec = {
      serverMs: 0,
      requests: [request('avatar', 1, 'data'), request('shell', 1, 'data'), request('app', 1, 'shell'), request('data', 1, 'app')],
    };
    expect(() => estimate(cyclic, { targetMs: 1000 })).toThrow(/dependency cycle/);
    const message = messageOf(() => estimate(cyclic, { targetMs: 1000 }));
    for (const id of ['shell', 'app', 'data']) expect(message).toMatch(new RegExp(`\\b${id}\\b`));
    expect(message).not.toMatch(/\bavatar\b/);
  });

  it('rejects a dependency on an unknown request with an error that names it', () => {
    const broken: ScreenSpec = { serverMs: 0, requests: [request('html', 1), request('js', 1, 'html', 'ghost')] };
    expect(() => estimate(broken, { targetMs: 1000 })).toThrow(/"ghost"/);
  });

  it('reports every profile over the budget with the milliseconds over', () => {
    const mobileMs = transferTime(mobile, 234000, 3) + 100;
    const desktopMs = transferTime(desktop, 234000, 3) + 100;
    const one = estimate(board, { targetMs: 1000 }).overBudget;
    expect(one.map((entry) => entry.profile)).toEqual([mobile.name]);
    expect(one[0]?.overByMs).toBeCloseTo(mobileMs - 1000, 6);
    const both = estimate(board, { targetMs: 300 }).overBudget;
    expect(both.map((entry) => entry.profile)).toEqual([mobile.name, desktop.name]);
    expect(both[1]?.overByMs).toBeCloseTo(desktopMs - 300, 6);
    expect(estimate(board, { targetMs: 5000 }).overBudget).toEqual([]);
  });

  it('merging named requests into one aggregated request never lengthens the critical path', () => {
    const before = estimate(board, { targetMs: 1000 });
    const chained = estimate(mergeRequests(board, ['js', 'api'], 'js+api'), { targetMs: 1000 });
    expect(chained.roundTrips).toBe(2);
    expect(chained.totalBytes).toBe(before.totalBytes);
    const siblings = estimate(mergeRequests(board, ['js', 'css'], 'js+css'), { targetMs: 1000 });
    expect(siblings.roundTrips).toBeLessThanOrEqual(before.roundTrips);
    const waterfall: ScreenSpec = {
      serverMs: 0,
      requests: [request('list', 1), request('c1', 1, 'list'), request('c2', 1, 'list'), request('c3', 1, 'list')],
    };
    const fused = estimate(mergeRequests(waterfall, ['c1', 'c2', 'c3'], 'comments'), { targetMs: 1000 });
    expect(fused.roundTrips).toBeLessThanOrEqual(estimate(waterfall, { targetMs: 1000 }).roundTrips);
    expect(fused.totalBytes).toBe(4);
  });
});
