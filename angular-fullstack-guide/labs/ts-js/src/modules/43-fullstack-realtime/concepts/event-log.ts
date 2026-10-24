// Section 3 model: a bounded event log with replay after `Last-Event-ID`. Our model of what an application builds on
// top of `SseEmitter` (Spring reads the `Last-Event-ID` header only if the handler declares it, and keeps no events).
// Ids are the numbers 1, 2, 3 ..., so a client's last id says exactly which events it missed. The "reload" event is
// our convention, not Spring's or the spec's: it tells the client to fetch a fresh snapshot.
import { formatEvent } from './sse-format';

export interface LoggedEvent {
  readonly id: string;
  readonly name: string;
  readonly data: string;
}

export type Replay =
  | { readonly kind: 'events'; readonly events: readonly LoggedEvent[] }
  | { readonly kind: 'too-old' };

export class EventLog {
  private readonly events: LoggedEvent[] = [];
  private lastId = 0;

  constructor(private readonly capacity: number) {}

  append(name: string, data: string): LoggedEvent {
    this.lastId += 1;
    const event: LoggedEvent = { id: String(this.lastId), name, data };
    this.events.push(event);
    if (this.events.length > this.capacity) this.events.shift();
    return event;
  }

  /** The events after `lastEventId`; `too-old` when one of them is gone from the log, or the id was never issued. */
  since(lastEventId: string): Replay {
    if (lastEventId === '') return { kind: 'events', events: [] };
    const seen = Number(lastEventId);
    const oldestKept = this.lastId - this.events.length + 1;
    const complete = /^\d+$/.test(lastEventId) && seen >= oldestKept - 1 && seen <= this.lastId;
    if (!complete) return { kind: 'too-old' };
    return { kind: 'events', events: this.events.filter((event) => Number(event.id) > seen) };
  }
}

/** What a handler writes when a client reconnects: the missed events, or one `reload` event. */
export function resume(log: EventLog, lastEventId: string): string {
  const replay = log.since(lastEventId);
  if (replay.kind === 'too-old') return formatEvent({ name: 'reload', data: '' });
  return replay.events.map((event) => formatEvent(event)).join('');
}
