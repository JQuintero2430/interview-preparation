// Section 1 claims, about our model (transport-model.ts): polling costs a request per interval whatever happens, long
// polling costs a request per answer and makes an event wait when it lands in the re-request gap, and a stream costs
// one request. Times are in seconds and chosen as exact binary fractions, so the sums are exact.
import { costOf, type Scenario, type Transport } from './transport-model';

const hour: Scenario = {
  durationSeconds: 3600,
  eventTimes: [],
  transitSeconds: 0.25,
  pollIntervalSeconds: 2,
  longPollTimeoutSeconds: 30,
};

describe('Module 43 · section 1', () => {
  it('Section 1: polling every 2 s for an hour makes 1800 requests whatever the number of events', () => {
    const quiet = costOf('polling', hour);
    const busy = costOf('polling', { ...hour, eventTimes: Array.from({ length: 50 }, (_, i) => 70 * (i + 1)) });
    expect(quiet.requests).toBe(1800);
    expect(busy.requests).toBe(1800);
    expect(quiet.emptyAnswers).toBe(1800);
    expect(busy.emptyAnswers).toBe(1750);
    expect(busy.latencies).toHaveLength(50);
  });

  it('Section 1: long polling makes one request per delivered event plus one per timeout', () => {
    const cost = costOf('long-polling', { ...hour, durationSeconds: 100, eventTimes: [10, 50] });
    expect(cost.requests).toBe(4);
    expect(cost.emptyAnswers).toBe(2);
    expect(cost.latencies).toEqual([0.25, 0.25]);
  });

  it('Section 1: an event that arrives while a long poll is re-requesting waits for the next request', () => {
    const cost = costOf('long-polling', { ...hour, durationSeconds: 20, eventTimes: [10, 10.125] });
    expect(cost.requests).toBe(2);
    expect(cost.latencies[0]).toBe(0.25);
    expect(cost.latencies[1]).toBe(0.625);
  });

  it('Section 1: a stream pays one request for any number of events', () => {
    const transports: readonly Transport[] = ['sse', 'websocket'];
    for (const transport of transports) {
      const quiet = costOf(transport, hour);
      const busy = costOf(transport, { ...hour, eventTimes: Array.from({ length: 500 }, (_, i) => i + 1) });
      expect(quiet.requests).toBe(1);
      expect(busy.requests).toBe(1);
      expect(busy.latencies).toEqual(Array.from({ length: 500 }, () => 0.25));
    }
  });
});
