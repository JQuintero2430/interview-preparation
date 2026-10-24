// Exercise 45.2, variant b (the alternative): a pure reducer turns (state, event) into the next state and a list of
// effects; a small runner performs the effects (send, save, post) and turns their answers back into events. Every
// decision is in `reduce`, which a test could call without fakes; the runner holds the only mutable field.
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

export interface State {
  readonly session: string;
  readonly count: number;
  readonly confirmed: ReadonlyMap<string, Card>;
  readonly outbox: readonly Op[];
  readonly conflicts: readonly Conflict[];
  readonly online: boolean;
  /** One write in flight at a time keeps the order the user made them in. */
  readonly sending: boolean;
  /** A send was lost; nothing is resent until the connection changes, so a dead network is not hammered. */
  readonly stalled: boolean;
}

export type SyncEvent =
  | { readonly type: 'write'; readonly cardId: string; readonly kind: OpKind; readonly value: string }
  | { readonly type: 'connectivity'; readonly online: boolean }
  | { readonly type: 'answered'; readonly op: Op; readonly result: ApplyResult }
  | { readonly type: 'lost' }
  | { readonly type: 'broadcast'; readonly card: Card };

export type Effect =
  | { readonly type: 'send'; readonly op: Op }
  | { readonly type: 'save'; readonly outbox: readonly Op[] }
  | { readonly type: 'post'; readonly card: Card };

type Step = readonly [State, readonly Effect[]];

function adopt(confirmed: ReadonlyMap<string, Card>, card: Card): ReadonlyMap<string, Card> {
  return new Map(confirmed).set(card.id, keepNewest(confirmed.get(card.id), card));
}

function write(state: State, cardId: string, kind: OpKind, value: string): Step {
  const known = state.confirmed.get(cardId);
  if (known === undefined) throw new Error(`unknown card ${cardId}`);
  const count = state.count + 1;
  const outbox = [...state.outbox, { opId: `${state.session}-${count}`, cardId, kind, value, baseVersion: known.version }];
  return [{ ...state, count, outbox }, [{ type: 'save', outbox }]];
}

function answered(state: State, op: Op, result: ApplyResult): Step {
  const idle = { ...state, sending: false };
  if (result.status === 'conflict') {
    const outbox = settleOutbox(state.outbox, op);
    const conflicts = [...state.conflicts, conflictOf(state.confirmed.get(op.cardId), op, result.current)];
    return [{ ...idle, outbox, conflicts, confirmed: adopt(state.confirmed, result.current) }, [{ type: 'save', outbox }]];
  }
  const outbox = settleOutbox(state.outbox, op, result.card);
  return [
    { ...idle, outbox, confirmed: adopt(state.confirmed, result.card) },
    [
      { type: 'save', outbox },
      { type: 'post', card: result.card },
    ],
  ];
}

function handle(state: State, event: SyncEvent): Step {
  switch (event.type) {
    case 'write':
      return write(state, event.cardId, event.kind, event.value);
    case 'connectivity':
      return [{ ...state, online: event.online, stalled: state.stalled && !event.online }, []];
    case 'answered':
      return answered(state, event.op, event.result);
    case 'lost':
      return [{ ...state, sending: false, stalled: true }, []];
    case 'broadcast':
      // Adopted only: no 'post' effect, so a change heard from another tab is never broadcast again.
      return [{ ...state, confirmed: adopt(state.confirmed, event.card) }, []];
  }
}

/** The whole decision: the event's own step, then the outbox head is sent if nothing blocks it. */
export function reduce(state: State, event: SyncEvent): Step {
  const [next, effects] = handle(state, event);
  const head = next.outbox[0];
  if (head === undefined || !next.online || next.sending || next.stalled) return [next, effects];
  return [{ ...next, sending: true }, [...effects, { type: 'send', op: head }]];
}

class EffectRunner implements BoardSync {
  private state: State;
  private work: Promise<void> = Promise.resolve();

  constructor(private readonly ports: Ports, options: SyncOptions) {
    this.state = {
      session: options.session,
      count: 0,
      confirmed: new Map(options.cards.map((card): [string, Card] => [card.id, card])),
      // Restored into the first state, so any later write queues behind the saved ones.
      outbox: decodeOutbox(ports.storage.get(OUTBOX_KEY)),
      conflicts: [],
      online: false,
      sending: false,
      stalled: false,
    };
    ports.channel.subscribe((message) => {
      const card = decodeCard(message);
      if (card !== undefined) this.dispatch({ type: 'broadcast', card });
    });
    ports.connectivity.onChange((online) => this.dispatch({ type: 'connectivity', online }));
    this.dispatch({ type: 'connectivity', online: ports.connectivity.online });
  }

  card(id: string): Card | undefined {
    return view(this.state.confirmed, this.state.outbox, id);
  }

  pending(): readonly Op[] {
    return this.state.outbox;
  }

  conflicts(): readonly Conflict[] {
    return this.state.conflicts;
  }

  move(cardId: string, columnId: string): void {
    this.dispatch({ type: 'write', cardId, kind: 'move', value: columnId });
  }

  rename(cardId: string, title: string): void {
    this.dispatch({ type: 'write', cardId, kind: 'rename', value: title });
  }

  idle(): Promise<void> {
    return settled(() => this.work);
  }

  private dispatch(event: SyncEvent): void {
    const [state, effects] = reduce(this.state, event);
    this.state = state;
    effects.forEach((effect) => this.run(effect));
  }

  private run(effect: Effect): void {
    switch (effect.type) {
      case 'save':
        this.ports.storage.set(OUTBOX_KEY, encodeOutbox(effect.outbox));
        return;
      case 'post':
        this.ports.channel.post(encodeCard(effect.card));
        return;
      case 'send':
        this.work = this.send(effect.op);
        return;
    }
  }

  private send(op: Op): Promise<void> {
    return this.ports.server.apply(op).then(
      (result) => this.dispatch({ type: 'answered', op, result }),
      () => this.dispatch({ type: 'lost' }),
    );
  }
}

export function createBoardSync(ports: Ports, options: SyncOptions): BoardSync {
  return new EffectRunner(ports, options);
}
