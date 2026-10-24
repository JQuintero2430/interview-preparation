// Exercise 46.5: seven criteria, each run over both variants (a: a class; b: a reducer whose effects a runner
// performs). Our fakes: the server is section 8's `createIdempotentServer` (draft-08 §2.6-§2.7 as section 8 records
// them; replaying the first response is our choice) over our in-memory ledger, which can hold a request in progress
// until the test releases it; `OurApi` can lose a response (the server applied the request, the client times out) or
// drop a request (it never arrives); `OurStorage` is a Map; `OurScheduler` moves only when the test advances it; keys
// come from a counter (`k1`, `k2`, …). No network, clock, timers, randomness or real storage.
import { createIdempotentServer, type IdempotentServer, type Transfer } from '../concepts/transfer';
import * as a from './a/transfer-client';
import * as b from './b/transfer-client';
import {
  STORAGE_KEY,
  type Answer,
  type ClientState,
  type KeyValueStorage,
  type Policy,
  type Ports,
  type Scheduler,
  type StatusRead,
  type TransferApi,
  type TransferClient,
  type TransferPayload,
} from './transfer-client';

const payload: TransferPayload = { from: 'acc-1', to: 'acc-2', amountMinor: 25000, currency: 'EUR' };
const DELAY = 1000;
const MAX_ATTEMPTS = 3;

/** Our ledger: `apply` moves money by appending a transfer; while held, it waits until the test calls `release`. */
function ourLedger(held: boolean) {
  const entries: Transfer[] = [];
  let release: () => void = () => undefined;
  const gate = held
    ? new Promise<void>((resolve) => {
        release = () => resolve();
      })
    : Promise.resolve();
  const apply = async (moved: TransferPayload, now: number): Promise<Transfer> => {
    await gate;
    const transfer: Transfer = { id: `t${entries.length + 1}`, payload: moved, at: now };
    entries.push(transfer);
    return transfer;
  };
  return { entries, apply, release: () => release() };
}

/** Time is a number that moves only in `advance`; due tasks run in order, each followed by a microtask flush. */
class OurScheduler implements Scheduler {
  now = 0;
  private tasks: { readonly at: number; readonly run: () => void }[] = [];

  after(ms: number, run: () => void): () => void {
    const task = { at: this.now + ms, run };
    this.tasks.push(task);
    return () => {
      this.tasks = this.tasks.filter((other) => other !== task);
    };
  }

  async advance(ms: number): Promise<void> {
    const end = this.now + ms;
    for (;;) {
      const due = this.tasks.filter((task) => task.at <= end).sort((x, y) => x.at - y.at)[0];
      if (due === undefined) break;
      this.tasks = this.tasks.filter((task) => task !== due);
      this.now = due.at;
      due.run();
      await flush();
    }
    this.now = end;
  }
}

type Fate = 'deliver' | 'lose' | 'drop';

class OurApi implements TransferApi {
  /** Every post as `key amountMinor`. */
  readonly posts: string[] = [];
  /** Status codes of the answers that reached the client. */
  readonly answered: number[] = [];
  readonly reads: string[] = [];
  private readonly fates: Fate[] = [];

  constructor(
    private readonly server: IdempotentServer,
    private readonly scheduler: OurScheduler,
  ) {}

  /** The fates of the next posts, in order; every later post is delivered. */
  will(...fates: Fate[]): void {
    this.fates.push(...fates);
  }

  post(key: string, sent: TransferPayload): Promise<Answer> {
    this.posts.push(`${key} ${sent.amountMinor}`);
    const fate = this.fates.shift() ?? 'deliver';
    if (fate === 'drop') return Promise.reject(new Error('timeout: the request never arrived'));
    const answer = this.server.post(key, sent, this.scheduler.now);
    if (fate === 'lose') return Promise.reject(new Error('timeout: the server got it, the response was lost'));
    return answer.then((response) => {
      this.answered.push(response.status);
      return response;
    });
  }

  findByKey(key: string): Promise<StatusRead> {
    this.reads.push(key);
    return Promise.resolve(this.server.find(key));
  }
}

class OurStorage implements KeyValueStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

/** Lets every promise already resolved run its continuation. */
async function flush(): Promise<void> {
  for (let i = 0; i < 20; i += 1) await Promise.resolve();
}

describe.each(['a', 'b'])('Exercise 46.5, variant %s', (variant) => {
  function makeClient(ports: Ports, policy: Policy): TransferClient {
    return variant === 'a' ? new a.TransferClientA(ports, policy) : new b.TransferClientB(ports, policy);
  }

  /** One server, ledger, storage and key counter; `open()` is a page load (a reload opens a second client). */
  function setup(held = false) {
    const scheduler = new OurScheduler();
    const money = ourLedger(held);
    const api = new OurApi(createIdempotentServer(money.apply), scheduler);
    const storage = new OurStorage();
    const states: ClientState[] = [];
    let made = 0;
    const open = () =>
      makeClient(
        { api, storage, scheduler, newKey: () => `k${++made}` },
        { maxAttempts: MAX_ATTEMPTS, retryDelayMs: DELAY, onChange: (state) => states.push(state) },
      );
    return { scheduler, money, api, storage, states, open, keysMade: () => made };
  }

  it('creates one key per confirmed intent and reuses it for every retry of that intent', async () => {
    const t = setup();
    const client = t.open();
    t.api.will('lose', 'lose');
    client.confirm(payload);
    await flush();
    await t.scheduler.advance(DELAY);
    await t.scheduler.advance(DELAY);
    expect(client.state()).toBe('succeeded');

    client.confirm(payload);
    await flush();
    expect(t.api.posts).toEqual(['k1 25000', 'k1 25000', 'k1 25000', 'k2 25000']);
    expect(t.keysMade()).toBe(2);
    expect(t.money.entries).toHaveLength(2);
  });

  it('ignores a second submit of the same intent while one is in flight', async () => {
    const t = setup(true);
    const client = t.open();
    client.confirm(payload);
    client.confirm(payload);
    await flush();
    expect(t.api.posts).toEqual(['k1 25000']);
    expect(t.keysMade()).toBe(1);

    t.money.release();
    await flush();
    expect(client.state()).toBe('succeeded');
    expect(t.money.entries).toHaveLength(1);
  });

  it('after a timeout, shows unknown, never failed, and retries with the same key', async () => {
    const t = setup();
    const client = t.open();
    t.api.will('lose');
    client.confirm(payload);
    await flush();
    expect(t.states).toEqual(['submitting', 'unknown']);
    expect(t.money.entries).toHaveLength(1);

    await t.scheduler.advance(DELAY - 1);
    expect(t.api.posts).toEqual(['k1 25000']);
    await t.scheduler.advance(1);
    expect(t.api.posts).toEqual(['k1 25000', 'k1 25000']);
    expect(t.api.answered).toEqual([201]);
    expect(t.states).toEqual(['submitting', 'unknown', 'succeeded']);
    expect(t.money.entries).toHaveLength(1);
  });

  it('on 409, waits and retries with the same key without changing the payload', async () => {
    const t = setup(true);
    const client = t.open();
    t.api.will('lose');
    client.confirm(payload);
    await flush();
    await t.scheduler.advance(DELAY);
    expect(t.api.answered).toEqual([409]);
    expect(client.state()).toBe('submitting');
    expect(t.money.entries).toHaveLength(0);

    t.money.release();
    await flush();
    await t.scheduler.advance(DELAY);
    expect(t.api.posts).toEqual(['k1 25000', 'k1 25000', 'k1 25000']);
    expect(t.api.answered).toEqual([409, 201]);
    expect(t.states).toEqual(['submitting', 'unknown', 'submitting', 'succeeded']);
    expect(t.money.entries).toHaveLength(1);
  });

  it('when retries are exhausted, settles an unknown transfer by reading its status by key', async () => {
    // The money moved, every response was lost: the status read finds the transfer.
    const t = setup();
    const client = t.open();
    t.api.will('lose', 'lose', 'lose');
    client.confirm(payload);
    await flush();
    await t.scheduler.advance(DELAY);
    await t.scheduler.advance(DELAY);
    expect(t.api.reads).toEqual(['k1']);
    expect(t.states).toEqual(['submitting', 'unknown', 'unknown', 'unknown', 'succeeded']);
    expect(t.money.entries).toHaveLength(1);

    // No request arrived: the status read answers 404, so the same key is sent once more.
    const u = setup();
    const other = u.open();
    u.api.will('drop', 'drop', 'drop');
    other.confirm(payload);
    await flush();
    await u.scheduler.advance(DELAY);
    await u.scheduler.advance(DELAY);
    expect(u.api.reads).toEqual(['k1']);
    expect(other.state()).toBe('submitting');
    expect(u.money.entries).toHaveLength(0);
    await u.scheduler.advance(DELAY);
    expect(u.api.posts).toEqual(['k1 25000', 'k1 25000', 'k1 25000', 'k1 25000']);
    expect(other.state()).toBe('succeeded');
    expect(u.states).not.toContain('failed');
    expect(u.money.entries).toHaveLength(1);
  });

  it('persists the pending intent and its key, so a reload resumes with the same key', async () => {
    const t = setup();
    const before = t.open();
    t.api.will('lose');
    before.confirm(payload);
    await flush();
    expect(t.storage.getItem(STORAGE_KEY)).toContain('"key":"k1"');

    before.dispose();
    const after = t.open();
    after.resume();
    await flush();
    await t.scheduler.advance(DELAY);
    expect(t.api.posts).toEqual(['k1 25000', 'k1 25000']);
    expect(t.keysMade()).toBe(1);
    expect(after.state()).toBe('succeeded');
    expect(t.money.entries).toHaveLength(1);
    expect(t.storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('treats an edited amount as a new intent with a new key', async () => {
    const t = setup();
    const client = t.open();
    client.confirm(payload);
    await flush();
    client.confirm({ ...payload, amountMinor: 30000 });
    await flush();
    expect(t.api.posts).toEqual(['k1 25000', 'k2 30000']);
    expect(t.api.answered).toEqual([201, 201]);
    expect(t.money.entries.map((entry) => entry.payload.amountMinor)).toEqual([25000, 30000]);
  });
});
