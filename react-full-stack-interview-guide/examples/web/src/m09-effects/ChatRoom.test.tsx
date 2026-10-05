import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { ChatRoom } from './ChatRoom';
import { connectionLog } from './chat';

beforeEach(() => {
  connectionLog.length = 0;
});

test('connects on mount and disconnects on unmount', () => {
  const { unmount } = render(<ChatRoom roomId="general" theme="light" onNotify={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Welcome to general' })).toBeInTheDocument();
  unmount();
  expect(connectionLog).toEqual(['connect:general', 'disconnect:general']);
});

test('switching rooms cleans up the old connection before opening the new one', () => {
  const { rerender } = render(<ChatRoom roomId="general" theme="light" onNotify={() => {}} />);
  rerender(<ChatRoom roomId="travel" theme="light" onNotify={() => {}} />);
  expect(connectionLog).toEqual(['connect:general', 'disconnect:general', 'connect:travel']);
});

test('changing the theme does not reconnect, but the next notification sees the new theme', () => {
  const onNotify = vi.fn();
  const { rerender } = render(<ChatRoom roomId="general" theme="light" onNotify={onNotify} />);
  rerender(<ChatRoom roomId="general" theme="dark" onNotify={onNotify} />);
  expect(connectionLog).toEqual(['connect:general']);

  rerender(<ChatRoom roomId="music" theme="dark" onNotify={onNotify} />);
  expect(onNotify).toHaveBeenLastCalledWith('Connected to music (dark theme)');
});

test('Strict Mode runs one extra setup + cleanup cycle in development', () => {
  render(
    <StrictMode>
      <ChatRoom roomId="general" theme="light" onNotify={() => {}} />
    </StrictMode>,
  );
  expect(connectionLog).toEqual(['connect:general', 'disconnect:general', 'connect:general']);
});
