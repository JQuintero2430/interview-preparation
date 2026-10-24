// Section 8 model: three write policies over one interleaving, an outbox replay with operation ids, and a broadcast
// channel. Our model, mirroring RFC 9110 §13.1.1 (If-Match uses the strong comparison; when the condition is false
// the method is not performed, and the server answers 412, or 2xx when the change appears already applied) and
// MDN BroadcastChannel (F3: a message reaches every listener except the sender); not a server's or browser's code.
// Our channel stands for one origin and delivers synchronously; a real one delivers asynchronously. No clock, no
// storage, no network: versions are numbers and the server is an in-memory fake.

export interface Card {
  readonly title: string;
  readonly column: string;
}

export type Field = keyof Card;

export interface Stored {
  readonly card: Card;
  readonly version: number;
  /** The version at which each field last changed. */
  readonly changedAt: Readonly<Record<Field, number>>;
}

export interface Write {
  readonly tab: string;
  /** The version the tab read before editing. */
  readonly baseVersion: number;
  readonly changes: Partial<Card>;
}

export type Policy = 'last-write-wins' | 'conditional' | 'field-merge';
export type Outcome = 'applied' | 'refused 412' | 'already applied 2xx';

export interface WriteResult {
  readonly tab: string;
  readonly outcome: Outcome;
}

export interface Run {
  readonly final: Stored;
  readonly results: readonly WriteResult[];
}

const FIELDS: readonly Field[] = ['title', 'column'];

/** Our entity tag for a version, a quoted string as in RFC 9110's examples. */
export function entityTag(version: number): string {
  return `"v${version}"`;
}

/** RFC 9110 §8.8.3.2 strong comparison: neither tag is weak and both are identical. */
export function strongMatch(a: string, b: string): boolean {
  return !a.startsWith('W/') && !b.startsWith('W/') && a === b;
}

/** A card at version 1, every field last changed at version 1. */
export function initial(card: Card): Stored {
  return { card, version: 1, changedAt: { title: 1, column: 1 } };
}

function fieldsOf(changes: Partial<Card>): Field[] {
  return FIELDS.filter((field) => changes[field] !== undefined);
}

function apply(stored: Stored, changes: Partial<Card>): Stored {
  const version = stored.version + 1;
  const changedAt: Record<Field, number> = { ...stored.changedAt };
  fieldsOf(changes).forEach((field) => {
    changedAt[field] = version;
  });
  return { card: { ...stored.card, ...changes }, version, changedAt };
}

function alreadyApplied(stored: Stored, changes: Partial<Card>): boolean {
  return fieldsOf(changes).every((field) => stored.card[field] === changes[field]);
}

function decide(policy: Policy, stored: Stored, write: Write): Outcome {
  if (policy === 'last-write-wins') return 'applied';
  const holds =
    policy === 'conditional'
      ? strongMatch(entityTag(write.baseVersion), entityTag(stored.version))
      : fieldsOf(write.changes).every((field) => stored.changedAt[field] <= write.baseVersion);
  if (holds) return 'applied';
  return alreadyApplied(stored, write.changes) ? 'already applied 2xx' : 'refused 412';
}

/** Runs the writes in arrival order under one policy; a stale write is never performed (RFC 9110 §13.1.1). */
export function applyWrites(policy: Policy, start: Stored, writes: readonly Write[]): Run {
  let final = start;
  const results: WriteResult[] = [];
  for (const write of writes) {
    const outcome = decide(policy, final, write);
    if (outcome === 'applied') final = apply(final, write.changes);
    results.push({ tab: write.tab, outcome });
  }
  return { final, results };
}

export interface Operation {
  readonly id: string;
  readonly cardId: string;
  readonly changes: Partial<Card>;
}

export type Delivery = 'applied' | 'duplicate';

export interface OutboxServer {
  receive(operation: Operation): Delivery;
}

/** Our in-memory server fake: applies each operation id at most once. */
export class InMemoryServer implements OutboxServer {
  readonly cards: Map<string, Card>;
  private readonly seen = new Set<string>();

  constructor(cards: ReadonlyMap<string, Card>) {
    this.cards = new Map(cards);
  }

  receive(operation: Operation): Delivery {
    if (this.seen.has(operation.id)) return 'duplicate';
    this.seen.add(operation.id);
    const card = this.cards.get(operation.cardId);
    if (card !== undefined) this.cards.set(operation.cardId, { ...card, ...operation.changes });
    return 'applied';
  }
}

/** Sends the queued operations in order; the server's id check makes a resend harmless. */
export function replay(outbox: readonly Operation[], server: OutboxServer): Delivery[] {
  return outbox.map((operation) => server.receive(operation));
}

export type Listener = (message: string) => void;

export interface Port {
  post(message: string): void;
}

/** Our fake of one named channel in one origin: a post reaches every joined tab except the sender (F3). */
export class FakeChannel {
  private readonly listeners = new Map<string, Listener>();

  join(tab: string, listener: Listener): Port {
    this.listeners.set(tab, listener);
    return { post: (message) => this.deliver(tab, message) };
  }

  private deliver(sender: string, message: string): void {
    this.listeners.forEach((listener, tab) => {
      if (tab !== sender) listener(message);
    });
  }
}
