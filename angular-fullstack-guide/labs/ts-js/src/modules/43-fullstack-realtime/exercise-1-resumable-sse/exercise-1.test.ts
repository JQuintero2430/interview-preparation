// Exercise 43.1: six criteria, each run over both variants (a: a hand line splitter over `TextDecoder`; b:
// `TextDecoderStream` and a line-splitting `TransformStream`). `fetch` is injected and returns a `Response` over a
// `ReadableStream` the test builds, so the test chooses every chunk boundary; reconnection waits run on Vitest fake
// timers; nothing opens a connection or reads the clock. `concepts/sse-parser.ts` (our section 2 model) is only the oracle.
import { parseEventStream } from '../concepts/sse-parser';
import { createClientA } from './a/client';
import { createClientB } from './b/client';
import type { FetchLike, SseClient, SseClientOptions, SseEvent, SseState } from './sse-client';

type Variant = 'a' | 'b';

const URL_UNDER_TEST = 'https://api.example.com/prices';
const INITIAL_RETRY_MS = 1000;
const encoder = new TextEncoder();

// The WHATWG example (§9.2.6) with the blank line its last block needs, so that it dispatches.
const WHATWG_EXAMPLE = ': test stream\n\ndata: first event\nid: 1\n\ndata:second event\nid\n\ndata:  third event\n\n';

interface Call {
  readonly headers: Record<string, string>;
  readonly signal: AbortSignal;
}

type Reply = (call: Call) => Response;

/** A body the test feeds chunk by chunk. It ends with the last chunk, or stays open when `hang` is true. */
function body(chunks: readonly (string | Uint8Array)[], hang = false, signal?: AbortSignal): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      if (!hang) controller.close();
      // A real `fetch` errors the body when its request is aborted.
      signal?.addEventListener('abort', () => controller.error(signal.reason), { once: true });
    },
  });
}

const eventStream = (chunks: readonly (string | Uint8Array)[], hang = false, contentType = 'text/event-stream'): Reply => (call) =>
  new Response(body(chunks, hang, call.signal), { status: 200, headers: { 'Content-Type': contentType } });

const status = (code: number, contentType = 'text/event-stream'): Reply => () =>
  new Response(null, { status: code, headers: { 'Content-Type': contentType } });

interface Rig {
  readonly client: SseClient;
  readonly calls: Call[];
  readonly events: SseEvent[];
  readonly states: SseState[];
}

/** The nth call gets the nth reply; a call past the end gets a 204, which stops the client. */
function createRig(variant: Variant, replies: readonly Reply[]): Rig {
  const calls: Call[] = [];
  const fetchStub: FetchLike = async (_url, init) => {
    const call: Call = { headers: init.headers, signal: init.signal };
    calls.push(call);
    return (replies[calls.length - 1] ?? status(204))(call);
  };
  const options: SseClientOptions = { url: URL_UNDER_TEST, fetch: fetchStub, initialRetryMs: INITIAL_RETRY_MS };
  const client = variant === 'a' ? createClientA(options) : createClientB(options);
  const events: SseEvent[] = [];
  const states: SseState[] = [];
  client.onEvent((event) => events.push(event));
  client.onState((state) => states.push(state));
  client.start();
  return { client, calls, events, states };
}

const settle = async (ms = 0): Promise<void> => void (await vi.advanceTimersByTimeAsync(ms));

beforeEach(() => void vi.useFakeTimers());
afterEach(() => void vi.useRealTimers());

describe.each<Variant>(['a', 'b'])('Exercise 43.1, variant %s', (variant) => {
  it('dispatches the events of the WHATWG example stream with their data and last event IDs', async () => {
    const rig = createRig(variant, [eventStream([WHATWG_EXAMPLE], false, 'text/event-stream; charset=utf-8')]);
    await settle();
    expect(rig.events).toEqual<SseEvent[]>([
      { type: 'message', data: 'first event', lastEventId: '1' },
      { type: 'message', data: 'second event', lastEventId: '' },
      { type: 'message', data: ' third event', lastEventId: '' },
    ]);
    expect(rig.events).toEqual(parseEventStream(WHATWG_EXAMPLE).events);
    expect(rig.calls[0]?.headers['Accept']).toBe('text/event-stream');
    rig.client.close();
  });

  it('handles a line and a CRLF split across chunk boundaries', async () => {
    // "é" is two bytes, so cutting at every byte offset also cuts a character in half.
    const text = 'event: price\r\ndata: café\r\ndata: 2\r\rdata: three\r\n\r\n';
    const bytes = encoder.encode(text);
    const expected = parseEventStream(text).events;
    expect(expected).toHaveLength(2);
    for (let cut = 1; cut < bytes.length; cut += 1) {
      const rig = createRig(variant, [eventStream([bytes.slice(0, cut), bytes.slice(cut)])]);
      await settle();
      expect(rig.events, `cut at byte ${cut}`).toEqual(expected);
      rig.client.close();
    }
    // The cut the oracle test cannot reach by luck: CR at the end of one chunk, LF at the start of the next.
    const rig = createRig(variant, [eventStream(['data: a\r', '\ndata: b\r\n', '\r\n'])]);
    await settle();
    expect(rig.events).toEqual<SseEvent[]>([{ type: 'message', data: 'a\nb', lastEventId: '' }]);
    rig.client.close();
  });

  it('reconnects after the body ends and sends the last event ID as `Last-Event-ID`', async () => {
    const rig = createRig(variant, [eventStream(['id: 1\ndata: a\n\nid: 2\ndata: b\n']), eventStream(['id: 3\ndata: c\n\n'], true)]);
    await settle();
    expect(rig.calls).toHaveLength(1);
    expect(rig.calls[0]?.headers['Last-Event-ID']).toBeUndefined();
    await settle(INITIAL_RETRY_MS);
    expect(rig.calls).toHaveLength(2);
    // The second event had no blank line before the body ended, so it was discarded and its id never took effect.
    expect(rig.calls[1]?.headers['Last-Event-ID']).toBe('1');
    expect(rig.events.map((event) => event.data)).toEqual(['a', 'c']);
    expect(rig.states).toEqual(['open', 'connecting', 'open']);
    rig.client.close();
  });

  it('waits the reconnection time set by `retry` before reconnecting', async () => {
    const rig = createRig(variant, [eventStream(['retry: 3000\nretry: 5s\ndata: a\n\n']), eventStream(['data: b\n\n']), eventStream([], true)]);
    await settle();
    await settle(2999);
    expect(rig.calls).toHaveLength(1);
    await settle(1);
    expect(rig.calls).toHaveLength(2);
    // The second body sets no `retry`, so the 3000 ms from the first stays.
    await settle(2999);
    expect(rig.calls).toHaveLength(2);
    await settle(1);
    expect(rig.calls).toHaveLength(3);
    rig.client.close();
  });

  it('stops without reconnecting on a 204, on any other non-200 status and on a wrong content type', async () => {
    const failures: Reply[] = [status(204), status(500), status(404), status(200, 'text/html'), status(200, 'application/json')];
    for (const failure of failures) {
      const rig = createRig(variant, [failure]);
      await settle(60_000);
      expect(rig.calls).toHaveLength(1);
      expect(rig.states).toEqual(['closed']);
      expect(rig.events).toEqual([]);
    }
  });

  it('`close()` aborts the request and schedules no reconnection', async () => {
    const open = createRig(variant, [eventStream(['data: a\n\n'], true)]);
    await settle();
    expect(open.states).toEqual(['open']);
    open.client.close();
    await settle(60_000);
    expect(open.calls[0]?.signal.aborted).toBe(true);
    expect(open.calls).toHaveLength(1);
    expect(open.states).toEqual(['open', 'closed']);

    // A close during the wait before a reconnection cancels the timer.
    const waiting = createRig(variant, [eventStream(['data: a\n\n'])]);
    await settle();
    expect(waiting.states).toEqual(['open', 'connecting']);
    waiting.client.close();
    await settle(60_000);
    expect(waiting.calls).toHaveLength(1);
    expect(waiting.states).toEqual(['open', 'connecting', 'closed']);
  });
});
