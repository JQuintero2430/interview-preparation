// Section 3 claims, about our models (sse-format.ts, event-log.ts) of what Spring MVC's SseEmitter writes and what an
// application must add to resume a stream. The kernel parser of section 2 reads the lines back, so the two models
// check each other. Nothing here runs Spring, opens a connection or reads a clock.
import { EventLog, resume } from './event-log';
import { parseEventStream, type SseEvent } from './sse-parser';
import { formatEvent } from './sse-format';

describe('Module 43 · section 3', () => {
  it('Section 3: our SseEmitter-style lines parse back into the same id, event and data', () => {
    const json = '{"symbol":"ACME","price":101.5}';
    const wire = formatEvent({ id: '42', name: 'price', data: json });
    expect(wire).toBe(`id:42\nevent:price\ndata:${json}\n\n`);
    expect(parseEventStream(wire).events).toEqual<SseEvent[]>([{ type: 'price', data: json, lastEventId: '42' }]);

    expect(formatEvent({ reconnectTimeMs: 3000 })).toBe('retry:3000\n\n');
    expect(parseEventStream(formatEvent({ reconnectTimeMs: 3000 })).reconnectionTime).toBe(3000);

    expect(formatEvent({ comment: 'keepalive' })).toBe(':keepalive\n\n');
    expect(parseEventStream(formatEvent({ comment: 'keepalive' })).events).toEqual([]);
    expect(formatEvent({})).toBe('');
  });

  it('Section 3: a multi-line data value becomes several data lines and parses back to one value', () => {
    const wire = formatEvent({ data: 'a\nb\r\nc\rd' });
    expect(wire).toBe('data:a\ndata:b\ndata:c\ndata:d\n\n');
    expect(parseEventStream(wire).events).toEqual<SseEvent[]>([{ type: 'message', data: 'a\nb\nc\nd', lastEventId: '' }]);

    expect(formatEvent({ comment: 'x\ny' })).toBe(':x\n:y\n\n');
    expect(() => formatEvent({ id: '1\n2' })).toThrow('illegal character');
    expect(() => formatEvent({ name: 'a\rb' })).toThrow('illegal character');
  });

  it('Section 3: the event log replays only events after Last-Event-ID', () => {
    const log = new EventLog(10);
    for (const price of ['100', '101', '102', '103', '104']) log.append('price', price);

    const replay = log.since('3');
    expect(replay).toEqual({
      kind: 'events',
      events: [
        { id: '4', name: 'price', data: '103' },
        { id: '5', name: 'price', data: '104' },
      ],
    });
    expect(log.since('5')).toEqual({ kind: 'events', events: [] });
    expect(log.since('')).toEqual({ kind: 'events', events: [] });

    const events = parseEventStream(resume(log, '3')).events;
    expect(events.map((event) => [event.lastEventId, event.type, event.data])).toEqual([
      ['4', 'price', '103'],
      ['5', 'price', '104'],
    ]);
  });

  it('Section 3: a Last-Event-ID older than the log returns too-old instead of a partial replay', () => {
    const log = new EventLog(3);
    for (const price of ['100', '101', '102', '103', '104']) log.append('price', price);

    expect(log.since('1')).toEqual({ kind: 'too-old' });
    expect(log.since('2')).toMatchObject({ kind: 'events', events: [{ id: '3' }, { id: '4' }, { id: '5' }] });
    expect(log.since('99')).toEqual({ kind: 'too-old' });
    expect(log.since('abc')).toEqual({ kind: 'too-old' });

    expect(parseEventStream(resume(log, '1')).events).toEqual<SseEvent[]>([
      { type: 'reload', data: '', lastEventId: '' },
    ]);
  });
});
