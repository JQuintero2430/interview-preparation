// Section 2 claims, about our models (sse-parser.ts, sse-reconnect.ts) of WHATWG HTML §9.2: how an event stream is
// split into lines and events, and what an EventSource does after each outcome. Every stream is a string the test
// builds, chunk by chunk; nothing opens a connection or reads a clock.
import { createSseParser, parseEventStream, type SseEvent } from './sse-parser';
import { nextStep, type SourceState } from './sse-reconnect';

// The spec's four-block example, verbatim (§9.2.6), then the blank line it says the last block still needs.
const WHATWG_EXAMPLE = ': test stream\n\ndata: first event\nid: 1\n\ndata:second event\nid\n\ndata:  third event\n';

describe('Module 43 · section 2', () => {
  it('Section 2: the WHATWG example stream dispatches three events and the bare id resets the last event ID', () => {
    const verbatim = parseEventStream(WHATWG_EXAMPLE);
    const terminated = parseEventStream(WHATWG_EXAMPLE + '\n');
    expect(verbatim.events).toHaveLength(2);
    expect(terminated.events).toEqual<SseEvent[]>([
      { type: 'message', data: 'first event', lastEventId: '1' },
      { type: 'message', data: 'second event', lastEventId: '' },
      { type: 'message', data: ' third event', lastEventId: '' },
    ]);
    expect(terminated.lastEventId).toBe('');
  });

  it('Section 2: a CRLF split across two chunks ends one line, not two', () => {
    const split = parseEventStream(['data: a\r', '\ndata: b\r\n\r\n']);
    const crOnly = parseEventStream(['﻿data: a\rda', 'ta: b\r\r']);
    expect(split.events).toEqual<SseEvent[]>([{ type: 'message', data: 'a\nb', lastEventId: '' }]);
    expect(crOnly.events).toEqual<SseEvent[]>([{ type: 'message', data: 'a\nb', lastEventId: '' }]);
  });

  it('Section 2: an event with no blank line before the end of the stream is discarded', () => {
    const spec = parseEventStream('data\n\ndata\ndata\n\ndata:');
    expect(spec.events.map((event) => event.data)).toEqual(['', '\n']);

    const events: SseEvent[] = [];
    const parser = createSseParser((event) => events.push(event));
    parser.push('id: 6\ndata: kept\n\nid: 7\ndata: lost\n');
    parser.end();
    expect(events.map((event) => event.data)).toEqual(['kept']);
    expect(parser.lastEventId).toBe('6');
  });

  it('Section 2: retry with a non-digit value is ignored', () => {
    expect(parseEventStream('retry: 5000\n').reconnectionTime).toBe(5000);
    expect(parseEventStream('retry: 5000\nretry: 5s\n').reconnectionTime).toBe(5000);
    expect(parseEventStream('retry: 5000\nretry:  3000\n').reconnectionTime).toBe(5000);
    expect(parseEventStream('retry: -1\n').reconnectionTime).toBeUndefined();
  });

  it('Section 2: a dropped connection reconnects with Last-Event-ID, a 204 stops and a 500 fails without reconnecting', () => {
    const stream = parseEventStream('retry: 3000\nid: 42\ndata: price\n\n');
    const state: SourceState = { lastEventId: stream.lastEventId, reconnectionTime: stream.reconnectionTime ?? 0 };
    const reconnect = {
      action: 'reconnect',
      readyState: 'CONNECTING',
      afterMs: 3000,
      headers: { 'Last-Event-ID': '42' },
    };

    expect(nextStep({ kind: 'response', status: 200, contentType: 'text/event-stream' }, state)).toEqual({
      action: 'open',
      readyState: 'OPEN',
    });
    expect(nextStep({ kind: 'body-ended' }, state)).toEqual(reconnect);
    expect(nextStep({ kind: 'network-error' }, state)).toEqual(reconnect);
    expect(nextStep({ kind: 'network-error' }, { ...state, lastEventId: '' })).toEqual({ ...reconnect, headers: {} });
    expect(nextStep({ kind: 'response', status: 204, contentType: null }, state)).toEqual({
      action: 'fail',
      readyState: 'CLOSED',
      reason: 'stop-requested',
    });
    expect(nextStep({ kind: 'response', status: 500, contentType: 'text/html' }, state)).toEqual({
      action: 'fail',
      readyState: 'CLOSED',
      reason: 'status',
    });
    expect(nextStep({ kind: 'response', status: 200, contentType: 'application/json' }, state)).toEqual({
      action: 'fail',
      readyState: 'CLOSED',
      reason: 'content-type',
    });
  });
});
