// Output question Q45.14: our cache-layer model (concepts/cache-layers.ts, our model, not a browser's or Angular's
// cache) on five reads of one card. Time is a passed number in milliseconds: the service worker keeps an entry a
// day, the HTTP cache 60 seconds, memory an hour; the CDN holds nothing for the API (maximum age 0).
import { createLayer, invalidate, lookup } from '../../modules/45-frontend-system-design-method/concepts/cache-layers';
import { captureLogs } from '../capture';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('45 · Q45.14', () => {
  it('Q45.14 our cache layers answer five reads of one card after an edit and a reload', async () => {
    const lines = await captureLogs((log) => {
      const key = 'GET /api/cards/7';
      let title = 'Plan sprint';
      const origin = (): string => title;
      const sw = createLayer('service worker', DAY);
      const http = createLayer('http', 60_000);
      const cdn = createLayer('cdn', 0);
      let memory = createLayer('memory', HOUR);
      const ask = (step: string, now: number): void => {
        const { layer, value } = lookup([memory, sw, http, cdn], key, now, origin);
        log(`${step}: ${layer}, ${value}`);
      };

      lookup([memory, sw, http, cdn], key, 0, origin); // an earlier visit filled every layer
      ask('1 before the edit', 1_000);
      title = 'Plan the sprint';
      memory.entries.set(key, { value: title, storedAt: 2_000, maxAgeMs: HOUR }); // the save refills memory only
      ask('2 same tab, after the edit', 3_000);
      memory = createLayer('memory', HOUR); // a reload empties memory
      ask('3 after a reload', 4_000);
      memory = createLayer('memory', HOUR);
      ask('4 reload, 61 s later', 61_000);
      invalidate([sw], key, 'service worker');
      memory = createLayer('memory', HOUR);
      ask('5 reload after clearing the worker', 62_000);
    });
    expect(lines).toEqual([
      '1 before the edit: memory, Plan sprint',
      '2 same tab, after the edit: memory, Plan the sprint',
      '3 after a reload: service worker, Plan sprint',
      '4 reload, 61 s later: service worker, Plan sprint',
      '5 reload after clearing the worker: origin, Plan the sprint',
    ]);
  });
});
