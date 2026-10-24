// Output question Q43.04: the WHATWG example stream plus an `id: 3`, a `retry` line and an unterminated block,
// through our sse-parser.ts model (WHATWG HTML §9.2.5-§9.2.6; the browser's own parser is not run).
import { createSseParser } from '../../modules/43-fullstack-realtime/concepts/sse-parser';
import { captureLogs } from '../capture';

describe('43 · Q43.04', () => {
  it('Q43.04 events, reconnection time, discarded block', async () => {
    const lines = await captureLogs((log) => {
      const stream = [
        ': test stream',
        '',
        'data: first event',
        'id: 1',
        '',
        'data:second event',
        'id',
        '',
        'data:  third event',
        'id: 3',
        'retry: 5000',
        '',
        'data: lost',
      ].join('\n');
      const parser = createSseParser((event) =>
        log(event.type, JSON.stringify(event.data), 'lastEventId', JSON.stringify(event.lastEventId)),
      );
      parser.push(stream);
      parser.end();
      log('reconnection time', parser.reconnectionTime);
    });
    expect(lines).toEqual([
      'message "first event" lastEventId "1"',
      'message "second event" lastEventId ""',
      'message " third event" lastEventId "3"',
      'reconnection time 5000',
    ]);
  });
});
