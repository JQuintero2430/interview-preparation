// Exercise 43.3: six criteria, each run over both variants (a: a signals service handing out `toSignal`; b:
// `rxResource` with `stream`). Every socket is our fake passed as `WebSocketCtor`, so no test opens a connection; the
// snapshot is a promise the test resolves; waits run on Vitest fake timers; rendering goes through a zoneless `TestBed`.
import { provideZonelessChangeDetection, type Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FakeWebSocket } from '../concepts/testing/fake-web-socket';
import { LabM43BoardSignals } from './a/board.store';
import { LabM43BoardResource } from './b/board.resource';
import {
  BOARD_OPTIONS,
  BOARD_SOURCE,
  BoardConnection,
  socketBoardSource,
  type BoardDelta,
  type BoardSnapshot,
  type Card,
} from './board';

type Variant = 'a' | 'b';

const COMPONENTS: Record<Variant, Type<unknown>> = { a: LabM43BoardSignals, b: LabM43BoardResource };
const GRACE_MS = 5000;
const WINDOW_MS = 16;
const RECONNECT_MS = 1000;

/** Snapshot loads the test answers one at a time, in call order. */
class SnapshotServer {
  loads = 0;
  private readonly pending: ((snapshot: BoardSnapshot) => void)[] = [];

  readonly load = (): Promise<BoardSnapshot> => {
    this.loads++;
    return new Promise((resolve) => this.pending.push(resolve));
  };

  async answer(snapshot: BoardSnapshot): Promise<void> {
    const resolve = this.pending.shift();
    if (resolve === undefined) throw new Error('no snapshot load is waiting');
    resolve(snapshot);
    await vi.advanceTimersByTimeAsync(0);
  }
}

function setUp(): SnapshotServer {
  const server = new SnapshotServer();
  const source = socketBoardSource({
    url: 'wss://app.example.com/board',
    reconnectMs: RECONNECT_MS,
    snapshot: server.load,
    WebSocketCtor: FakeWebSocket,
  });
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: BOARD_SOURCE, useValue: source },
      { provide: BOARD_OPTIONS, useValue: { graceMs: GRACE_MS, windowMs: WINDOW_MS } },
    ],
  });
  return server;
}

/** Runs the render hooks, then the resource's effect one tick later, then lets the conflation window pass. */
async function render(fixture: ComponentFixture<unknown>, ms = 0): Promise<void> {
  TestBed.tick();
  await vi.advanceTimersByTimeAsync(ms);
  TestBed.tick();
  fixture.detectChanges();
}

function socketAt(index: number): FakeWebSocket {
  const socket = FakeWebSocket.instances[index];
  if (socket === undefined) throw new Error(`no socket ${index} was created`);
  return socket;
}

function send(socket: FakeWebSocket, seq: number, change: Card): void {
  const delta: BoardDelta = { seq, change };
  socket.receive(JSON.stringify(delta));
}

function cardsOf(fixture: ComponentFixture<unknown>): string[] {
  const host: HTMLElement = fixture.nativeElement;
  return [...host.querySelectorAll('li')].map((item) => item.textContent.trim());
}

function stateOf(fixture: ComponentFixture<unknown>): string {
  const host: HTMLElement = fixture.nativeElement;
  return host.querySelector('.state')?.textContent.trim() ?? '';
}

const card = (id: string, column: string): Card => ({ id, title: `Card ${id}`, column });

beforeEach(() => {
  FakeWebSocket.instances.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe.each<Variant>(['a', 'b'])('Exercise 43.3, variant %s', (variant) => {
  async function mount(server: SnapshotServer, snapshot: BoardSnapshot): Promise<ComponentFixture<unknown>> {
    const fixture = TestBed.createComponent(COMPONENTS[variant]);
    await render(fixture);
    socketAt(0).open();
    await server.answer(snapshot);
    await render(fixture, WINDOW_MS);
    return fixture;
  }

  it('shows the snapshot, then applies deltas in sequence order', async () => {
    const server = setUp();
    const fixture = await mount(server, { seq: 10, cards: [card('A', 'todo'), card('B', 'todo')] });
    expect(cardsOf(fixture)).toEqual(['todo: Card A', 'todo: Card B']);

    send(socketAt(0), 11, card('A', 'doing'));
    send(socketAt(0), 12, card('A', 'done'));
    send(socketAt(0), 13, card('C', 'todo'));
    await render(fixture, WINDOW_MS);
    expect(cardsOf(fixture)).toEqual(['done: Card A', 'todo: Card B', 'todo: Card C']);
  });

  it("ignores deltas whose sequence is not newer than the snapshot's", async () => {
    const server = setUp();
    const fixture = TestBed.createComponent(COMPONENTS[variant]);
    await render(fixture);
    socketAt(0).open();
    // The socket is open before the snapshot arrives: 9 and 10 are already in it, 11 is not.
    send(socketAt(0), 9, card('A', 'todo'));
    send(socketAt(0), 10, card('A', 'doing'));
    send(socketAt(0), 11, card('B', 'done'));
    await server.answer({ seq: 10, cards: [card('A', 'doing'), card('B', 'todo')] });
    send(socketAt(0), 10, card('A', 'todo')); // a duplicate after the snapshot
    await render(fixture, WINDOW_MS);

    expect(cardsOf(fixture)).toEqual(['doing: Card A', 'done: Card B']);
    expect(server.loads).toBe(1);
  });

  it('reloads the snapshot once when a sequence gap appears', async () => {
    const server = setUp();
    const fixture = await mount(server, { seq: 10, cards: [card('A', 'todo')] });
    send(socketAt(0), 11, card('A', 'doing'));
    // 12 never arrives: 13 is a gap, so one reload starts and 14 and 15 wait behind it.
    send(socketAt(0), 13, card('B', 'todo'));
    send(socketAt(0), 14, card('B', 'doing'));
    send(socketAt(0), 15, card('A', 'done'));
    expect(server.loads).toBe(2);

    await server.answer({ seq: 14, cards: [card('A', 'doing'), card('B', 'doing')] });
    await render(fixture, WINDOW_MS);
    expect(server.loads).toBe(2);
    expect(cardsOf(fixture)).toEqual(['done: Card A', 'doing: Card B']);
  });

  it('opens one connection for two components and closes it after the last leaves and the grace period ends', async () => {
    setUp();
    const first = TestBed.createComponent(COMPONENTS[variant]);
    const second = TestBed.createComponent(COMPONENTS[variant]);
    // Nothing opens before the first render, so a server render would open nothing.
    expect(FakeWebSocket.instances).toHaveLength(0);
    await render(first);
    await render(second);
    expect(FakeWebSocket.instances).toHaveLength(1);
    socketAt(0).open();

    first.destroy();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(socketAt(0).closeCalls).toHaveLength(0);

    second.destroy();
    await vi.advanceTimersByTimeAsync(GRACE_MS - 1);
    expect(socketAt(0).closeCalls).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(socketAt(0).closeCalls).toHaveLength(1);
    expect(TestBed.inject(BoardConnection).state()).toBe('closed');
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('applies a burst of deltas as at most one update per conflation window', async () => {
    const server = setUp();
    const fixture = await mount(server, { seq: 0, cards: [] });
    const boards: BoardSnapshot[] = [];
    const counting = TestBed.inject(BoardConnection).board$.subscribe((board) => boards.push(board));

    for (let seq = 1; seq <= 500; seq++) send(socketAt(0), seq, card(`P${seq % 5}`, `column ${seq}`));
    await vi.advanceTimersByTimeAsync(WINDOW_MS - 1);
    expect(boards).toHaveLength(0);
    await render(fixture, 1);
    expect(boards).toHaveLength(1);
    expect(boards[0]?.seq).toBe(500);
    expect(cardsOf(fixture)).toHaveLength(5);
    expect(cardsOf(fixture)).toContain('column 500: Card P0');

    // A burst spread over two windows gives two updates, the last one complete.
    send(socketAt(0), 501, card('P1', 'column 501'));
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    send(socketAt(0), 502, card('P2', 'column 502'));
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    expect(boards.map((board) => board.seq)).toEqual([500, 501, 502]);
    counting.unsubscribe();
  });

  it('shows a reconnecting state while the connection is down', async () => {
    const server = setUp();
    const fixture = TestBed.createComponent(COMPONENTS[variant]);
    await render(fixture);
    expect(stateOf(fixture)).toBe('connecting');
    socketAt(0).open();
    await server.answer({ seq: 1, cards: [card('A', 'todo')] });
    await render(fixture, WINDOW_MS);
    expect(stateOf(fixture)).toBe('open');

    socketAt(0).fail();
    await render(fixture);
    expect(stateOf(fixture)).toBe('reconnecting');
    // The last board stays on screen, marked by the state as possibly out of date.
    expect(cardsOf(fixture)).toEqual(['todo: Card A']);
    await vi.advanceTimersByTimeAsync(RECONNECT_MS);
    expect(FakeWebSocket.instances).toHaveLength(2);
    await render(fixture);
    expect(stateOf(fixture)).toBe('reconnecting');
    socketAt(1).open();
    await render(fixture);
    expect(stateOf(fixture)).toBe('open');
  });
});
