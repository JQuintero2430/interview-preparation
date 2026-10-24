// Exercise 43.2, variant b (the alternative): a hand-written `new Observable` that owns the socket, the heart-beat
// watchdog and the reconnect timer. It listens to `close` only: the WebSockets Standard fires `close` in every case,
// after `error` when the connection failed, so one handler sees every drop exactly once.
import { Observable } from 'rxjs';
import { ChannelSession, type Channel, type ChannelConfig } from '../channel';

export function createHandChannel(config: ChannelConfig): Channel {
  const session = new ChannelSession(config);
  const frames$ = new Observable<string>((subscriber) => {
    let socket: WebSocket | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;

    // Detach first, so the `close` event our own `close()` causes later is not taken for a drop.
    const discard = (): void => {
      clearTimeout(watchdog);
      if (socket === undefined) return;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      if (socket.readyState === socket.CONNECTING || socket.readyState === socket.OPEN) socket.close();
      socket = undefined;
    };
    const drop = (): void => {
      discard();
      reconnect = setTimeout(connect, session.dropped());
    };
    const arm = (): void => {
      clearTimeout(watchdog);
      watchdog = setTimeout(drop, 2 * config.heartbeatMs);
    };
    function connect(): void {
      const opened = new config.WebSocketCtor(config.url);
      socket = opened;
      opened.onopen = () => session.opened((data) => opened.send(data));
      opened.onmessage = (event) => {
        arm();
        subscriber.next(String(event.data));
      };
      opened.onclose = drop;
      arm();
    }

    connect();
    return () => {
      clearTimeout(reconnect);
      discard();
    };
  });
  const subscription = frames$.subscribe((data) => session.received(data));
  return session.channel(() => subscription.unsubscribe());
}
