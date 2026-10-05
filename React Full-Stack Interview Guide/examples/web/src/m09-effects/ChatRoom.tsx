import { useEffect, useEffectEvent } from 'react';
import { createConnection } from './chat';

type Props = {
  roomId: string;
  theme: 'light' | 'dark';
  onNotify: (message: string) => void;
};

export function ChatRoom({ roomId, theme, onNotify }: Props) {
  // Non-reactive logic: reads the latest theme/onNotify without making the effect depend on them.
  const onConnected = useEffectEvent(() => {
    onNotify(`Connected to ${roomId} (${theme} theme)`);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', onConnected);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // theme and onNotify are deliberately NOT here; onConnected must never be.

  return <h2>Welcome to {roomId}</h2>;
}
