// Exercise 43.2, variant a (the solution): RxJS `webSocket` with `timeout`, `retry` and `repeat` (RxJS 7.8.2).
// A clean close completes a `WebSocketSubject` and anything else errors it, so `retry` covers errors and `repeat`
// covers completions; `timeout` turns two silent heart-beat intervals into an error that `retry` handles too.
import { repeat, retry, timeout, timer } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { ChannelSession, type Channel, type ChannelConfig } from '../channel';

export function createRxChannel(config: ChannelConfig): Channel {
  const session = new ChannelSession(config);
  const socket = webSocket<string>({
    url: config.url,
    WebSocketCtor: config.WebSocketCtor,
    // Raw text both ways: the session encodes and decodes, and a heart-beat is not JSON.
    serializer: (data) => data,
    deserializer: (event) => String(event.data),
    openObserver: { next: () => session.opened((data) => socket.next(data)) },
  });
  const wait = () => timer(session.dropped());
  const subscription = socket
    .pipe(timeout({ each: 2 * config.heartbeatMs }), retry({ delay: wait }), repeat({ delay: wait }))
    .subscribe((data) => session.received(data));
  return session.channel(() => subscription.unsubscribe());
}
