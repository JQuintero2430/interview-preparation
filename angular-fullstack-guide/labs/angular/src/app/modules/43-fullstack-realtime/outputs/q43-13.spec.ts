// Output question Q43.13: RxJS 7.8.2 `webSocket` over our FakeWebSocket (never a real connection), passed as `WebSocketCtor`.
// The answer's snippet shows console.log where this spec calls `log`.
import { retry } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { FakeWebSocket } from '../concepts/testing/fake-web-socket';

function socketAt(index: number): FakeWebSocket {
  const socket = FakeWebSocket.instances[index];
  if (socket === undefined) throw new Error(`no socket ${index} was created`);
  return socket;
}

describe('43 · Q43.13', () => {
  beforeEach(() => {
    FakeWebSocket.instances.length = 0;
  });

  it('Q43.13 sent before open, a clean close completes, an unclean close errors after one retry', () => {
    const lines: string[] = [];
    const log = (...args: unknown[]) => lines.push(args.join(' '));
    const config = { url: 'wss://app.example.com/ws', WebSocketCtor: FakeWebSocket };

    const clean = webSocket<{ n: number }>(config);
    clean.subscribe({ complete: () => log('complete') });
    clean.next({ n: 1 });
    clean.next({ n: 2 });
    socketAt(0).open();
    log('sent', socketAt(0).sent.join(' '));
    socketAt(0).closeFromServer(1000, true);

    FakeWebSocket.instances.length = 0;
    const unclean = webSocket<{ n: number }>(config).pipe(retry(1));
    unclean.subscribe({ error: (error: unknown) => log('error', error instanceof CloseEvent ? error.code : 'other') });
    socketAt(0).closeFromServer(1006, false);
    socketAt(1).closeFromServer(1006, false);
    log('sockets', FakeWebSocket.instances.length);

    expect(lines).toEqual(['sent {"n":1} {"n":2}', 'complete', 'error 1006', 'sockets 2']);
  });
});
