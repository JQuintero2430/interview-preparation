// Exercise 45.2: the types and helpers both variants share (a: a class holding the board, the outbox and the conflicts;
// b: a pure reducer over events plus an effect runner). Our model, not a library's or a browser's code. The server's
// three outcomes mirror RFC 9110 §13.1.1 as section 8 states it (M45 F2): 'conflict' is a write that was not performed
// (the 412 branch), 'already-applied' is the 2xx branch for a change that appears already applied; 'ok' performed it.
// The channel mirrors MDN BroadcastChannel (F3): the sender does not receive its own message. Server, channel, storage
// and connectivity are interfaces; the test passes our in-memory fakes. No clock, no randomness: an operation id is a
// page-load id plus a counter (a real page would use crypto.randomUUID() for the page-load id).

export interface Card {
  readonly id: string;
  readonly title: string;
  readonly columnId: string;
  readonly version: number;
}

export type OpKind = 'move' | 'rename';

/** One queued write; `baseVersion` is the card version the tab knew when the user made it. */
export interface Op {
  readonly opId: string;
  readonly cardId: string;
  readonly kind: OpKind;
  readonly value: string;
  readonly baseVersion: number;
}

export type ApplyResult =
  | { readonly status: 'ok'; readonly card: Card }
  | { readonly status: 'conflict'; readonly current: Card }
  | { readonly status: 'already-applied'; readonly card: Card };

export interface BoardServer {
  /** Rejects when the request or its response is lost. */
  apply(op: Op): Promise<ApplyResult>;
}

export interface Channel {
  post(message: string): void;
  subscribe(listener: (message: string) => void): void;
}

export interface KeyValueStorage {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
}

export interface Connectivity {
  readonly online: boolean;
  onChange(listener: (online: boolean) => void): void;
}

/** The four collaborators, passed in so the test can give fakes. */
export interface Ports {
  readonly server: BoardServer;
  readonly channel: Channel;
  readonly storage: KeyValueStorage;
  readonly connectivity: Connectivity;
}

export interface SyncOptions {
  /** This page load's id; operation ids are `${session}-${n}`, so they stay unique across reloads. */
  readonly session: string;
  /** The cards as the first read returned them. */
  readonly cards: readonly Card[];
}

/** Both versions of a refused write: the card this tab showed, and the server's card that won. */
export interface Conflict {
  readonly mine: Card;
  readonly theirs: Card;
}

export interface BoardSync {
  card(id: string): Card | undefined;
  pending(): readonly Op[];
  conflicts(): readonly Conflict[];
  move(cardId: string, columnId: string): void;
  rename(cardId: string, title: string): void;
  /** Resolves when no send is in flight. */
  idle(): Promise<void>;
}

export type CreateBoardSync = (ports: Ports, options: SyncOptions) => BoardSync;

export const OUTBOX_KEY = 'board-outbox';

export function applyOp(card: Card, op: Op): Card {
  return op.kind === 'move' ? { ...card, columnId: op.value } : { ...card, title: op.value };
}

/** What the screen shows: the confirmed card with this tab's queued writes applied on top, in order. */
export function view(confirmed: ReadonlyMap<string, Card>, outbox: readonly Op[], id: string): Card | undefined {
  const start = confirmed.get(id);
  return start && outbox.filter((op) => op.cardId === id).reduce(applyOp, start);
}

/** The newer of two copies of a card; a copy that is not newer changes nothing, so a repeated message applies once. */
export function keepNewest(known: Card | undefined, card: Card): Card {
  return known !== undefined && known.version > card.version ? known : card;
}

/**
 * Removes a settled write. When the server confirmed it at `card.version`, later writes on that card that were made on
 * the same base version were made on top of it, so they move to the new version instead of conflicting with our own write.
 */
export function settleOutbox(outbox: readonly Op[], settled: Op, card?: Card): Op[] {
  return outbox
    .filter((op) => op.opId !== settled.opId)
    .map((op) =>
      card !== undefined && op.cardId === settled.cardId && op.baseVersion === settled.baseVersion
        ? { ...op, baseVersion: card.version }
        : op,
    );
}

export function conflictOf(known: Card | undefined, op: Op, theirs: Card): Conflict {
  return { mine: applyOp({ ...(known ?? theirs), version: op.baseVersion }, op), theirs };
}

/** Resolves once the work promise stops being replaced, so sends started while waiting are waited for too. */
export async function settled(current: () => Promise<void>): Promise<void> {
  for (let work = current(); ; work = current()) {
    await work;
    if (work === current()) return;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCard(value: unknown): value is Card {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['title'] === 'string' &&
    typeof value['columnId'] === 'string' &&
    typeof value['version'] === 'number'
  );
}

function isOp(value: unknown): value is Op {
  return (
    isRecord(value) &&
    typeof value['opId'] === 'string' &&
    typeof value['cardId'] === 'string' &&
    (value['kind'] === 'move' || value['kind'] === 'rename') &&
    typeof value['value'] === 'string' &&
    typeof value['baseVersion'] === 'number'
  );
}

export function encodeCard(card: Card): string {
  return JSON.stringify({ card });
}

/** A message from another tab, or undefined when it is not a card message. */
export function decodeCard(message: string): Card | undefined {
  const parsed: unknown = JSON.parse(message);
  const card = isRecord(parsed) ? parsed['card'] : undefined;
  return isCard(card) ? card : undefined;
}

export function encodeOutbox(outbox: readonly Op[]): string {
  return JSON.stringify(outbox);
}

/** The outbox saved before a reload; nothing saved, or anything unreadable, restores none. */
export function decodeOutbox(saved: string | undefined): Op[] {
  const parsed: unknown = saved === undefined ? [] : JSON.parse(saved);
  const items: unknown[] = Array.isArray(parsed) ? parsed : [];
  return items.filter(isOp);
}
