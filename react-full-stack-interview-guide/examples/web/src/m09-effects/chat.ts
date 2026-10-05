// A fake chat server: the "external system" our effects synchronize with.
// Every call is recorded in `connectionLog` so tests can assert on the exact sequence.
export const connectionLog: string[] = [];

export type Connection = {
  connect(): void;
  disconnect(): void;
  on(event: 'connected', listener: () => void): void;
};

export function createConnection(roomId: string): Connection {
  const listeners: Array<() => void> = [];
  return {
    connect() {
      connectionLog.push(`connect:${roomId}`);
      listeners.forEach((l) => l());
    },
    disconnect() {
      connectionLog.push(`disconnect:${roomId}`);
    },
    on(_event, listener) {
      listeners.push(listener);
    },
  };
}
