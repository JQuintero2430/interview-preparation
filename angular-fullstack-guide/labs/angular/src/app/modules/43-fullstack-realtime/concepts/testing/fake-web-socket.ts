// Our fake, not the browser's `WebSocket`. Node's and jsdom's `WebSocket` open real connections, so the specs pass this
// class as `WebSocketCtor` (RxJS `webSocket`) and no test touches the network. It models only what RxJS 7.8.2
// `WebSocketSubject` uses: the `on*` handlers, `send`, `close` and `readyState`. The constructor records the URL; `sent`
// logs every `send`; the test hooks (`open`, `receive`, `fail`, `closeFromServer`) stand in for the network and fire the
// event the browser would. Simplification: `close()` goes straight to `CLOSED` (no `CLOSING`) and fires no `close` event.

export class FakeWebSocket extends EventTarget implements WebSocket {
  static readonly instances: FakeWebSocket[] = [];

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  binaryType: BinaryType = 'blob';
  readonly bufferedAmount = 0;
  readonly extensions = '';
  readonly protocol = '';
  readyState: 0 | 1 | 2 | 3 = this.CONNECTING;

  onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
  onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;

  readonly sent: string[] = [];
  readonly closeCalls: { code: number | undefined; reason: string | undefined }[] = [];

  constructor(
    readonly url: string,
    readonly protocols?: string | string[],
  ) {
    super();
    FakeWebSocket.instances.push(this);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (typeof data !== 'string') throw new Error('FakeWebSocket records text frames only');
    this.sent.push(data);
  }

  close(code?: number, reason?: string): void {
    this.closeCalls.push({ code, reason });
    this.readyState = this.CLOSED;
  }

  /** Test hook: the handshake succeeded (`101 Switching Protocols`). */
  open(): void {
    this.readyState = this.OPEN;
    this.fire(new Event('open'), this.onopen);
  }

  /** Test hook: one text frame arrived. */
  receive(data: string): void {
    this.fire(new MessageEvent('message', { data }), this.onmessage);
  }

  /** Test hook: the connection broke with no Close frame, so a browser fires `error`, then `close` with 1006. */
  fail(): void {
    this.fire(new Event('error'), this.onerror);
    this.closeFromServer(1006, false);
  }

  /** Test hook: a `close` event with a chosen `code` and `wasClean`; `wasClean` is true when the closing handshake finished. */
  closeFromServer(code: number, wasClean = true, reason = ''): void {
    this.readyState = this.CLOSED;
    this.fire(new CloseEvent('close', { code, wasClean, reason }), this.onclose);
  }

  private fire<E extends Event>(event: E, handler: ((this: WebSocket, ev: E) => unknown) | null): void {
    this.dispatchEvent(event);
    handler?.call(this, event);
  }
}
