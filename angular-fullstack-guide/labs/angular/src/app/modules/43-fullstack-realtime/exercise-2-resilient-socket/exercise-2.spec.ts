// Exercise 43.2: six criteria, each run over both variants (a: RxJS `webSocket` with `timeout`, `retry` and
// `repeat`; b: a hand-written Observable that owns the socket and its timers). Every socket is our fake passed as
// `WebSocketCtor`, so no test opens a connection; waits run on Vitest fake timers; the jitter comes from `random`.
import { FakeWebSocket } from '../concepts/testing/fake-web-socket';
import { createRxChannel } from './a/rx-channel';
import { createHandChannel } from './b/hand-channel';
import { HEARTBEAT, type Channel, type ChannelConfig, type ChannelMessage, type WireFrame } from './channel';

type Variant = 'a' | 'b';

const BASE: ChannelConfig = {
  url: 'wss://app.example.com/ws',
  backoff: { initialMs: 1000, maxMs: 30000 },
  heartbeatMs: 10000,
  // At 1 every wait is its full exponential ceiling.
  random: () => 1,
  WebSocketCtor: FakeWebSocket,
};

function create(variant: Variant, overrides: Partial<ChannelConfig> = {}): Channel {
  const config = { ...BASE, ...overrides };
  return variant === 'a' ? createRxChannel(config) : createHandChannel(config);
}

function socketAt(index: number): FakeWebSocket {
  const socket = FakeWebSocket.instances[index];
  if (socket === undefined) throw new Error(`no socket ${index} was created`);
  return socket;
}

const framesOf = (index: number): WireFrame[] => socketAt(index).sent.map((data): WireFrame => JSON.parse(data));

/** Returns the given values in turn, then repeats the last. */
function sequence(...values: number[]): () => number {
  let next = 0;
  return () => values[Math.min(next++, values.length - 1)] ?? 1;
}

/** Moves the clock to just before `ms`, checks no new socket exists yet, then to `ms` and checks one does. */
function expectReconnectAfter(ms: number): void {
  const before = FakeWebSocket.instances.length;
  vi.advanceTimersByTime(ms - 1);
  expect(FakeWebSocket.instances).toHaveLength(before);
  vi.advanceTimersByTime(1);
  expect(FakeWebSocket.instances).toHaveLength(before + 1);
}

beforeEach(() => {
  FakeWebSocket.instances.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe.each<Variant>(['a', 'b'])('Exercise 43.2, variant %s', (variant) => {
  it('reconnects after an unclean close with delays of 1, 2 and 4 seconds, capped at the maximum, with the injected jitter', () => {
    const channel = create(variant, { backoff: { initialMs: 1000, maxMs: 4000 }, random: sequence(1, 1, 1, 1, 0) });
    // No socket opens, so nothing resets the backoff; the fifth draw is 0, the lowest jitter: half the 4 s cap.
    for (const [index, wait] of [1000, 2000, 4000, 4000, 2000].entries()) {
      socketAt(index).fail();
      expect(channel.state()).toBe('reconnecting');
      expectReconnectAfter(wait);
    }
    channel.close();
  });

  it("reconnects after a server close with code 1001 but not after the client's own `close()`", () => {
    const channel = create(variant);
    expect(channel.state()).toBe('connecting');
    socketAt(0).open();
    // 1001 "going away" (RFC 6455 §7.4.1) with a finished closing handshake: a clean close.
    socketAt(0).closeFromServer(1001);
    expect(channel.state()).toBe('reconnecting');
    expectReconnectAfter(1000);
    socketAt(1).open();
    expect(channel.state()).toBe('open');

    channel.close();
    expect(socketAt(1).closeCalls).toHaveLength(1);
    expect(channel.state()).toBe('closed');
    vi.advanceTimersByTime(60000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  it('resends every active subscription after reconnecting', () => {
    const channel = create(variant);
    channel.subscribe('prices');
    const leaveNews = channel.subscribe('news');
    channel.subscribe('alerts');
    socketAt(0).open();
    leaveNews();
    socketAt(0).fail();
    expectReconnectAfter(1000);
    socketAt(1).open();

    expect(framesOf(0)).toEqual([
      { type: 'subscribe', topic: 'prices' },
      { type: 'subscribe', topic: 'news' },
      { type: 'subscribe', topic: 'alerts' },
      { type: 'unsubscribe', topic: 'news' },
    ]);
    expect(framesOf(1)).toEqual([
      { type: 'subscribe', topic: 'prices' },
      { type: 'subscribe', topic: 'alerts' },
    ]);
    channel.close();
  });

  it('queues messages sent while disconnected and flushes them in order after reconnecting', () => {
    const channel = create(variant);
    channel.subscribe('chat');
    channel.send({ topic: 'chat', body: 'zero' });
    socketAt(0).open();
    channel.send({ topic: 'chat', body: 'one' });
    socketAt(0).fail();
    channel.send({ topic: 'chat', body: 'two' });
    channel.send({ topic: 'chat', body: 'three' });
    expectReconnectAfter(1000);
    expect(socketAt(1).sent).toEqual([]);
    socketAt(1).open();

    expect(framesOf(0)).toEqual([
      { type: 'subscribe', topic: 'chat' },
      { type: 'send', topic: 'chat', body: 'zero' },
      { type: 'send', topic: 'chat', body: 'one' },
    ]);
    // The subscription goes first, so a reply to a queued message has a subscriber.
    expect(framesOf(1)).toEqual([
      { type: 'subscribe', topic: 'chat' },
      { type: 'send', topic: 'chat', body: 'two' },
      { type: 'send', topic: 'chat', body: 'three' },
    ]);
    channel.close();
  });

  it('treats two missed heart-beat intervals as a dead connection and reconnects', () => {
    const channel = create(variant);
    const received: ChannelMessage[] = [];
    channel.messages$.subscribe((message) => received.push(message));
    socketAt(0).open();
    vi.advanceTimersByTime(15000);
    socketAt(0).receive(HEARTBEAT);
    socketAt(0).receive(JSON.stringify({ type: 'message', topic: 'prices', body: '101' }));

    // Silent since the last frame: still alive at 19,999 ms, dead at 20,000 ms (two 10 s intervals).
    vi.advanceTimersByTime(19999);
    expect(socketAt(0).closeCalls).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(socketAt(0).closeCalls).toHaveLength(1);
    expect(channel.state()).toBe('reconnecting');
    expectReconnectAfter(1000);
    expect(received).toEqual([{ topic: 'prices', body: '101' }]);
    channel.close();
  });

  it('resets the backoff after a connection stays open for one heart-beat interval', () => {
    const channel = create(variant);
    socketAt(0).fail();
    expectReconnectAfter(1000);
    socketAt(1).fail();
    expectReconnectAfter(2000);
    // Open for less than one interval: not a success, so the wait keeps doubling.
    socketAt(2).open();
    vi.advanceTimersByTime(9999);
    socketAt(2).fail();
    expectReconnectAfter(4000);
    // Open for one full interval: the next wait starts again at one second.
    socketAt(3).open();
    vi.advanceTimersByTime(10000);
    socketAt(3).fail();
    expectReconnectAfter(1000);
    channel.close();
  });
});
