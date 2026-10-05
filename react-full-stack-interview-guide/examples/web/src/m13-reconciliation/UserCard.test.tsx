import type { ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';
import { UserCardClass } from './UserCardClass';
import { requestLog } from './userApi';

const versions: Array<[string, ComponentType<{ userId: string }>]> = [
  ['class', UserCardClass],
  ['hooks', UserCard],
];

beforeEach(() => {
  requestLog.length = 0;
  document.title = '';
});

describe.each(versions)('%s version', (_name, Card) => {
  test('shows loading, then the user, and syncs document.title', async () => {
    render(<Card userId="2" />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Grace Hopper' })).toBeInTheDocument();
    expect(document.title).toBe('Grace Hopper');
  });

  test('switching users aborts the old request, so a slow stale response never wins', async () => {
    const { rerender } = render(<Card userId="1" />); // slow
    rerender(<Card userId="2" />); // fast
    expect(await screen.findByRole('heading', { name: 'Grace Hopper' })).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 80)); // let the slow response time out (it was aborted)
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    expect(requestLog).toEqual(['request:1', 'abort:1', 'request:2']);
  });

  test('unmounting aborts the in-flight request', () => {
    const { unmount } = render(<Card userId="1" />);
    unmount();
    expect(requestLog).toEqual(['request:1', 'abort:1']);
  });

  test('an unknown user renders an error alert', async () => {
    render(<Card userId="404" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('User 404 not found');
  });
});
