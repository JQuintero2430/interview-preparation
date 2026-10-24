import { webSocket } from 'rxjs/webSocket';
import { FakeWebSocket } from './testing/fake-web-socket';
import { liveSocket } from './live-socket';

// Every socket is our fake passed as `WebSocketCtor`: no test opens a connection. Waits run on Vitest fake timers, and
// the jitter source is fixed at 1, so each wait equals its exponential cap.
interface Wire {
  readonly type: string;
  readonly topic?: string;
  readonly price?: number;
}

const config = {
  url: 'wss://app.example.com/ws',
  backoff: { initialMs: 1000, maxMs: 30000 },
  random: () => 1,
  WebSocketCtor: FakeWebSocket,
};

function socketAt(index: number): FakeWebSocket {
  const socket = FakeWebSocket.instances[index];
  if (socket === undefined) throw new Error(`no socket ${index} was created`);
  return socket;
}

describe('Section 6: the Angular WebSocket client', () => {
  beforeEach(() => {
    FakeWebSocket.instances.length = 0;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('Section 6: messages sent before the socket opens are buffered and sent in order on open, before the resubscription', () => {
    const client = liveSocket<Wire>({ ...config, resubscribe: () => [{ type: 'subscribe', topic: 'prices' }] });
    client.messages$.subscribe();
    client.send({ type: 'ping' });
    client.send({ type: 'hello' });
    expect(socketAt(0).sent).toEqual([]);

    socketAt(0).open();
    expect(socketAt(0).sent.map((frame) => (JSON.parse(frame) as Wire).type)).toEqual(['ping', 'hello', 'subscribe']);
  });

  it('Section 6: a clean close completes the stream, an unclean close errors it with the close code, and the last unsubscribe closes the socket', () => {
    const events: string[] = [];
    const record = (label: string) => ({
      next: (value: Wire) => events.push(`${label} next ${value.type}`),
      error: (error: unknown) => events.push(`${label} error ${error instanceof CloseEvent ? error.code : 'other'}`),
      complete: () => events.push(`${label} complete`),
    });
    const options = { url: config.url, WebSocketCtor: FakeWebSocket };

    webSocket<Wire>(options).subscribe(record('clean'));
    socketAt(0).open();
    socketAt(0).receive('{"type":"tick"}');
    socketAt(0).closeFromServer(1001);

    webSocket<Wire>(options).subscribe(record('unclean'));
    socketAt(1).open();
    socketAt(1).closeFromServer(1006, false);

    // Our fake fires `error` before `close`, as a failing browser connection does: the stream errors with that `Event`.
    webSocket<Wire>(options).subscribe(record('failed'));
    socketAt(2).open();
    socketAt(2).fail();

    const subscription = webSocket<Wire>(options).subscribe();
    socketAt(3).open();
    subscription.unsubscribe();

    expect(events).toEqual(['clean next tick', 'clean complete', 'unclean error 1006', 'failed error other']);
    expect(socketAt(3).closeCalls).toHaveLength(1);
  });

  it('Section 6: an unclean close reconnects after a growing wait that resets on open, and every open resends the subscription', () => {
    const client = liveSocket<Wire>({ ...config, resubscribe: () => [{ type: 'subscribe', topic: 'prices' }] });
    client.messages$.subscribe();
    socketAt(0).open();
    socketAt(0).fail();

    vi.advanceTimersByTime(999);
    expect(FakeWebSocket.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(2);

    // Socket 1 never opens, so the next wait doubles; socket 2 opens, so the wait after it starts again at one second.
    socketAt(1).fail();
    vi.advanceTimersByTime(1999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);
    socketAt(2).open();
    socketAt(2).fail();
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(4);
    socketAt(3).open();

    const subscribes = [0, 2, 3].map((index) => socketAt(index).sent);
    expect(subscribes).toEqual(Array.from({ length: 3 }, () => ['{"type":"subscribe","topic":"prices"}']));
    expect(socketAt(1).sent).toEqual([]);
  });

  it('Section 6: a clean server close reconnects through repeat, and unsubscribing stops it without a reconnect', () => {
    const prices: number[] = [];
    const client = liveSocket<Wire>(config);
    const subscription = client.messages$.subscribe((message) => prices.push(message.price ?? 0));
    socketAt(0).open();
    socketAt(0).closeFromServer(1001);
    expect(FakeWebSocket.instances).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    socketAt(1).open();
    socketAt(1).receive('{"type":"price","price":101}');
    expect(prices).toEqual([101]);

    subscription.unsubscribe();
    expect(socketAt(1).closeCalls).toHaveLength(1);
    vi.advanceTimersByTime(60000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });
});
