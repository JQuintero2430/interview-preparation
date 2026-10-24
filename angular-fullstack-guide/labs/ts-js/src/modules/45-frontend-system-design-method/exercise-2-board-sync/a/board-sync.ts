// Exercise 45.2, variant a (the solution): one class holds the confirmed cards, the outbox and the conflicts, and one
// promise chain sends the outbox head first, so writes leave in the order they were made and one at a time.
import {
  OUTBOX_KEY,
  conflictOf,
  decodeCard,
  decodeOutbox,
  encodeCard,
  encodeOutbox,
  keepNewest,
  settleOutbox,
  settled,
  view,
  type ApplyResult,
  type BoardSync,
  type Card,
  type Conflict,
  type Op,
  type OpKind,
  type Ports,
  type SyncOptions,
} from '../board-sync';

class OutboxBoardSync implements BoardSync {
  private readonly confirmed: Map<string, Card>;
  private outbox: readonly Op[];
  private readonly found: Conflict[] = [];
  private count = 0;
  // Set when a send is lost: nothing is resent until the connection changes, so a queued second drain cannot resend at once.
  private stalled = false;
  private tail: Promise<void> = Promise.resolve();

  constructor(
    private readonly ports: Ports,
    private readonly options: SyncOptions,
  ) {
    this.confirmed = new Map(options.cards.map((card): [string, Card] => [card.id, card]));
    // Restored before anything can be written, so a write made after a reload queues behind the saved ones.
    this.outbox = decodeOutbox(ports.storage.get(OUTBOX_KEY));
    ports.channel.subscribe((message) => this.receive(message));
    ports.connectivity.onChange((online) => {
      if (!online) return;
      this.stalled = false;
      this.kick();
    });
    this.kick();
  }

  card(id: string): Card | undefined {
    return view(this.confirmed, this.outbox, id);
  }

  pending(): readonly Op[] {
    return this.outbox;
  }

  conflicts(): readonly Conflict[] {
    return [...this.found];
  }

  move(cardId: string, columnId: string): void {
    this.write(cardId, 'move', columnId);
  }

  rename(cardId: string, title: string): void {
    this.write(cardId, 'rename', title);
  }

  idle(): Promise<void> {
    return settled(() => this.tail);
  }

  private write(cardId: string, kind: OpKind, value: string): void {
    const known = this.confirmed.get(cardId);
    if (known === undefined) throw new Error(`unknown card ${cardId}`);
    this.count += 1;
    const op: Op = { opId: `${this.options.session}-${this.count}`, cardId, kind, value, baseVersion: known.version };
    this.save([...this.outbox, op]);
    this.kick();
  }

  // Chained, not started in parallel: a second drain begins only after the first, so the head is never sent twice at once.
  private kick(): void {
    this.tail = this.tail.then(() => this.drain());
  }

  private async drain(): Promise<void> {
    for (let op = this.outbox[0]; op !== undefined && this.ports.connectivity.online && !this.stalled; op = this.outbox[0]) {
      let result: ApplyResult;
      try {
        result = await this.ports.server.apply(op);
      } catch {
        this.stalled = true;
        return; // lost on the way: the write stays queued, with its id, until the connection comes back
      }
      this.settle(op, result);
    }
  }

  private settle(op: Op, result: ApplyResult): void {
    if (result.status === 'conflict') {
      this.found.push(conflictOf(this.confirmed.get(op.cardId), op, result.current));
      this.adopt(result.current);
      this.save(settleOutbox(this.outbox, op));
      return;
    }
    this.adopt(result.card);
    this.save(settleOutbox(this.outbox, op, result.card));
    this.ports.channel.post(encodeCard(result.card));
  }

  // A message from another tab is adopted, never posted again; a copy that is not newer changes nothing.
  private receive(message: string): void {
    const card = decodeCard(message);
    if (card !== undefined) this.adopt(card);
  }

  private adopt(card: Card): void {
    this.confirmed.set(card.id, keepNewest(this.confirmed.get(card.id), card));
  }

  private save(outbox: readonly Op[]): void {
    this.outbox = outbox;
    this.ports.storage.set(OUTBOX_KEY, encodeOutbox(outbox));
  }
}

export function createBoardSync(ports: Ports, options: SyncOptions): BoardSync {
  return new OutboxBoardSync(ports, options);
}
