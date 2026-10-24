// Exercise 45.2: six criteria, each run over both variants (a: a class with a promise chain; b: a pure reducer plus an
// effect runner). The server, channel, storage and connectivity are our in-memory fakes, not a browser's or a server's
// code: OurServer decides like section 8's model (an id it has seen is 'already-applied', the 2xx branch; a stale base
// version is a 'conflict', not performed); OurChannelHub delivers to every tab except the sender, synchronously (F3 says
// a real channel excludes the sender too, and delivers asynchronously). No clock, no timers, no randomness, no real
// storage, channel or network: interleavings are made by the order of calls and by losing one response on purpose.
import { createBoardSync as createA } from './a/board-sync';
import { createBoardSync as createB } from './b/board-sync';
import {
  OUTBOX_KEY,
  applyOp,
  type ApplyResult,
  type BoardServer,
  type Card,
  type Channel,
  type Connectivity,
  type CreateBoardSync,
  type KeyValueStorage,
  type Op,
  type Ports,
} from './board-sync';

class OurServer implements BoardServer {
  readonly received: Op[] = [];
  readonly outcomes: ApplyResult['status'][] = [];
  private readonly cards: Map<string, Card>;
  private readonly appliedIds = new Set<string>();
  private loseNext = false;

  constructor(cards: readonly Card[]) {
    this.cards = new Map(cards.map((card): [string, Card] => [card.id, card]));
  }

  card(id: string): Card | undefined {
    return this.cards.get(id);
  }

  /** A write from another device, which no tab of this browser hears about. */
  renameElsewhere(id: string, title: string): void {
    const current = this.cards.get(id);
    if (current !== undefined) this.cards.set(id, { ...current, title, version: current.version + 1 });
  }

  /** The next write is performed, but its response never arrives. */
  loseNextResponse(): void {
    this.loseNext = true;
  }

  apply(op: Op): Promise<ApplyResult> {
    this.received.push(op);
    const current = this.cards.get(op.cardId);
    if (current === undefined) return Promise.reject(new Error(`unknown card ${op.cardId}`));
    const result = this.decide(op, current);
    this.outcomes.push(result.status);
    if (!this.loseNext) return Promise.resolve(result);
    this.loseNext = false;
    return Promise.reject(new Error('response lost'));
  }

  private decide(op: Op, current: Card): ApplyResult {
    if (this.appliedIds.has(op.opId)) return { status: 'already-applied', card: current };
    if (op.baseVersion !== current.version) return { status: 'conflict', current };
    const card = applyOp({ ...current, version: current.version + 1 }, op);
    this.cards.set(card.id, card);
    this.appliedIds.add(op.opId);
    return { status: 'ok', card };
  }
}

class OurChannelHub {
  readonly posts: { readonly from: string; readonly message: string }[] = [];
  private readonly listeners: { readonly tab: string; readonly listener: (message: string) => void }[] = [];

  port(tab: string): Channel {
    return {
      post: (message) => {
        this.posts.push({ from: tab, message });
        this.listeners.filter((entry) => entry.tab !== tab).forEach((entry) => entry.listener(message));
      },
      subscribe: (listener) => {
        this.listeners.push({ tab, listener });
      },
    };
  }
}

class OurStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();

  get(key: string): string | undefined {
    return this.values.get(key);
  }

  set(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class OurConnectivity implements Connectivity {
  private readonly listeners: ((online: boolean) => void)[] = [];

  constructor(public online: boolean) {}

  onChange(listener: (online: boolean) => void): void {
    this.listeners.push(listener);
  }

  set(online: boolean): void {
    this.online = online;
    this.listeners.forEach((listener) => listener(online));
  }
}

const card = (id: string, title: string, columnId: string, version = 1): Card => ({ id, title, columnId, version });
const board = (): Card[] => [card('c1', 'Plan', 'todo'), card('c2', 'Build', 'todo')];

interface Tab {
  readonly server: OurServer;
  readonly hub: OurChannelHub;
  readonly storage: OurStorage;
  readonly connectivity: OurConnectivity;
}

function tab(overrides: Partial<Tab> = {}): Tab {
  return {
    server: overrides.server ?? new OurServer(board()),
    hub: overrides.hub ?? new OurChannelHub(),
    storage: overrides.storage ?? new OurStorage(),
    connectivity: overrides.connectivity ?? new OurConnectivity(true),
  };
}

function ports(t: Tab, name: string): Ports {
  return { server: t.server, channel: t.hub.port(name), storage: t.storage, connectivity: t.connectivity };
}

describe.each(['a', 'b'])('Exercise 45.2, variant %s', (variant) => {
  const create: CreateBoardSync = variant === 'a' ? createA : createB;

  it('shows a move at once and restores the previous column exactly when the server refuses it', async () => {
    const t = tab();
    t.server.renameElsewhere('c1', 'Plan, reviewed');
    const sync = create(ports(t, 'A'), { session: 'A', cards: board() });

    sync.move('c1', 'doing');
    expect(sync.card('c1')?.columnId).toBe('doing');

    await sync.idle();
    expect(t.server.outcomes).toEqual(['conflict']);
    expect(sync.card('c1')).toEqual(card('c1', 'Plan, reviewed', 'todo', 2));
    expect(sync.card('c2')).toEqual(card('c2', 'Build', 'todo'));
    expect(sync.pending()).toEqual([]);
  });

  it('queues writes made offline and sends them in order when the connection returns', async () => {
    const t = tab({ connectivity: new OurConnectivity(false) });
    const sync = create(ports(t, 'A'), { session: 'A', cards: board() });

    sync.move('c1', 'doing');
    sync.rename('c1', 'Plan the sprint');
    sync.move('c2', 'done');
    await sync.idle();
    expect(t.server.received).toEqual([]);
    expect(sync.card('c1')).toEqual(card('c1', 'Plan the sprint', 'doing'));
    expect(sync.pending().map((op) => op.opId)).toEqual(['A-1', 'A-2', 'A-3']);

    t.connectivity.set(true);
    await sync.idle();
    expect(t.server.received.map((op) => op.opId)).toEqual(['A-1', 'A-2', 'A-3']);
    expect(t.server.outcomes).toEqual(['ok', 'ok', 'ok']);
    expect(t.server.card('c1')).toEqual(card('c1', 'Plan the sprint', 'doing', 3));
    expect(sync.card('c1')).toEqual(card('c1', 'Plan the sprint', 'doing', 3));
    expect(sync.pending()).toEqual([]);
  });

  it('sends every write with an operation id and does not apply a write twice when the server reports it already applied', async () => {
    const t = tab();
    const sync = create(ports(t, 'A'), { session: 'A', cards: board() });

    t.server.loseNextResponse();
    sync.move('c1', 'doing');
    await sync.idle();
    expect(sync.pending().map((op) => op.opId)).toEqual(['A-1']);
    expect(t.server.card('c1')).toEqual(card('c1', 'Plan', 'doing', 2));

    t.connectivity.set(false);
    t.connectivity.set(true);
    await sync.idle();
    expect(t.server.received.map((op) => op.opId)).toEqual(['A-1', 'A-1']);
    expect(t.server.outcomes).toEqual(['ok', 'already-applied']);
    expect(t.server.card('c1')).toEqual(card('c1', 'Plan', 'doing', 2));
    expect(sync.card('c1')).toEqual(card('c1', 'Plan', 'doing', 2));
    expect(sync.pending()).toEqual([]);

    sync.rename('c2', 'Build the API');
    await sync.idle();
    const ids = t.server.received.map((op) => op.opId);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(2);
  });

  it("sends the version it knows with every write and, on a conflict, keeps the server's card and reports both versions instead of overwriting", async () => {
    const t = tab();
    const sync = create(ports(t, 'A'), { session: 'A', cards: board() });
    t.server.renameElsewhere('c1', 'Plan (edited on a phone)');

    sync.rename('c1', 'Plan the sprint');
    await sync.idle();
    expect(t.server.received.map((op) => op.baseVersion)).toEqual([1]);
    expect(t.server.outcomes).toEqual(['conflict']);
    const theirs = card('c1', 'Plan (edited on a phone)', 'todo', 2);
    expect(t.server.card('c1')).toEqual(theirs);
    expect(sync.card('c1')).toEqual(theirs);
    expect(sync.conflicts()).toEqual([{ mine: card('c1', 'Plan the sprint', 'todo', 1), theirs }]);

    sync.rename('c1', 'Plan the sprint');
    await sync.idle();
    expect(t.server.received.map((op) => op.baseVersion)).toEqual([1, 2]);
    expect(t.server.card('c1')).toEqual(card('c1', 'Plan the sprint', 'todo', 3));
  });

  it('restores the outbox from storage after a reload, before any new write is sent', async () => {
    const storage = new OurStorage();
    const server = new OurServer(board());
    const before = create(ports(tab({ server, storage, connectivity: new OurConnectivity(false) }), 'A'), { session: 'load-1', cards: board() });
    before.move('c1', 'doing');
    before.rename('c2', 'Build the API');
    expect(storage.get(OUTBOX_KEY)).toBeDefined();

    // The reload: the old page is gone; a new one starts online with the same storage and a new page-load id.
    const after = create(ports(tab({ server, storage }), 'A'), { session: 'load-2', cards: board() });
    expect(after.pending().map((op) => op.opId)).toEqual(['load-1-1', 'load-1-2']);
    expect(after.card('c1')?.columnId).toBe('doing');
    after.move('c2', 'done');
    await after.idle();

    expect(server.received.map((op) => op.opId)).toEqual(['load-1-1', 'load-1-2', 'load-2-1']);
    expect(server.card('c2')).toEqual(card('c2', 'Build the API', 'done', 3));
    expect(after.pending()).toEqual([]);
  });

  it('applies a change broadcast by another tab once and does not broadcast it again', async () => {
    const shared = tab();
    const a = create(ports(shared, 'A'), { session: 'A', cards: board() });
    const b = create(ports(tab({ server: shared.server, hub: shared.hub }), 'B'), { session: 'B', cards: board() });

    a.move('c1', 'doing');
    await a.idle();
    await b.idle();
    const moved = card('c1', 'Plan', 'doing', 2);
    expect(b.card('c1')).toEqual(moved);
    expect(shared.hub.posts.map((post) => post.from)).toEqual(['A']);

    // The same message heard again (a third tab repeating it) changes nothing and B still posts nothing.
    shared.hub.port('C').post(shared.hub.posts[0]?.message ?? '');
    await b.idle();
    expect(b.card('c1')).toEqual(moved);
    expect(a.card('c1')).toEqual(moved);
    expect(shared.hub.posts.map((post) => post.from)).toEqual(['A', 'C']);
    expect(shared.server.received.map((op) => op.opId)).toEqual(['A-1']);
    expect(b.pending()).toEqual([]);
  });
});
