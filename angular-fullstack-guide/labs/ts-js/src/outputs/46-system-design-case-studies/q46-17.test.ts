// Output question Q46.17: our aggregator (concepts/aggregator.ts, our model, not a charting library's code). One window
// of mixed events for a counter, a gauge and a latency widget, then a silent stream. Times are numbers the test passes:
// no clock, timer, socket, randomness or network.
import { createAggregator, type WidgetSpec } from '../../modules/46-system-design-case-studies/concepts/aggregator';
import { captureLogs } from '../capture';

const widgets: readonly WidgetSpec[] = [
  { id: 'orders', kind: 'counter', staleAfterMs: 5000 },
  { id: 'cpu', kind: 'gauge', staleAfterMs: 5000 },
  { id: 'api', kind: 'latency', staleAfterMs: 5000 },
];

describe('46 · Q46.17', () => {
  it('Q46.17 our aggregator', async () => {
    const lines = await captureLogs((log) => {
      const hub = createAggregator(widgets);
      [3, 4, 5].forEach((value, i) => hub.push({ widgetId: 'orders', value, at: 10 + i * 10 }));
      [70, 65].forEach((value, i) => hub.push({ widgetId: 'cpu', value, at: 15 + i * 10 }));
      for (let i = 0; i < 20; i += 1) hub.push({ widgetId: 'api', value: 200 - i * 10, at: 10 + i * 10 });

      const flushed = hub.flush(250);
      log(`orders (counter): ${flushed['orders']}`);
      log(`cpu (gauge): ${flushed['cpu']}`);
      log(`api (latency): ${flushed['api']}`);
      log(`next window: ${JSON.stringify(hub.flush(500))}`);

      const staleFrom = (id: string): number => {
        let now = 250;
        while (hub.status(id, now) === 'live') now += 1;
        return now;
      };
      for (const id of ['orders', 'cpu', 'api']) log(`${id} stale from ${staleFrom(id)} ms`);
    });

    expect(lines).toEqual([
      'orders (counter): 12',
      'cpu (gauge): 65',
      'api (latency): 190',
      'next window: {}',
      'orders stale from 5031 ms',
      'cpu stale from 5026 ms',
      'api stale from 5201 ms',
    ]);
  });
});
