// Our fake, not the browser's `EventSource`. jsdom 30.1.1 ships no `EventSource`, and a real one would open a
// connection, so the specs pass this class through the factory token in `../sse-client.ts`. It follows the state
// machine of WHATWG HTML §9.2 (read 2026-10-21): `CONNECTING`, `OPEN`, `CLOSED`; an `error` while the browser retries
// leaves `readyState` at `CONNECTING`, a failed connection sets `CLOSED`; `close()` sets `CLOSED`. Test hooks (`open`,
// `emit`, `errorWhileReconnecting`, `fail`) stand in for the network. Listeners run only for the type they were
// added for, as in the browser, so a named event nobody listed for reaches nobody.

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 2;

type Listener = (event: Event) => void;

export class FakeEventSource {
  static readonly instances: FakeEventSource[] = [];

  readyState = CONNECTING;
  closeCalls = 0;
  private readonly listeners = new Map<string, Listener[]>();

  constructor(
    readonly url: string,
    readonly init: { readonly withCredentials: boolean },
  ) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close(): void {
    this.closeCalls += 1;
    this.readyState = CLOSED;
  }

  /** Test hook: the response arrived with `text/event-stream`. */
  open(): void {
    this.readyState = OPEN;
    this.dispatch(new Event('open'));
  }

  /** Test hook: an event of `type` ("message" when the stream names none) with its `data` and last event ID. */
  emit(type: string, data: string, lastEventId = ''): void {
    this.dispatch(new MessageEvent(type, { data, lastEventId }));
  }

  /** Test hook: the connection dropped and the browser is waiting to reconnect. */
  errorWhileReconnecting(): void {
    this.readyState = CONNECTING;
    this.dispatch(new Event('error'));
  }

  /** Test hook: the connection failed for good (a 500, a wrong `Content-Type`), so no reconnect follows. */
  fail(): void {
    this.readyState = CLOSED;
    this.dispatch(new Event('error'));
  }

  private dispatch(event: Event): void {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
  }
}
