import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeServer } from './api';
import { LikeButton, toggled } from './LikeButton';

beforeEach(() => fakeServer.reset());

const like = () => screen.getByRole('button', { name: 'Like' });

test('toggled() is the pure "expected next state"', () => {
  expect(toggled({ liked: false, likes: 10 })).toEqual({ liked: true, likes: 11 });
  expect(toggled({ liked: true, likes: 11 })).toEqual({ liked: false, likes: 10 });
});

test('the optimistic value shows immediately and stays when the server confirms', async () => {
  const user = userEvent.setup();
  fakeServer.hold();
  render(<LikeButton postId="post-1" initial={{ liked: false, likes: 10 }} />);

  await user.click(like());
  // The server has not answered yet, but the UI already shows the expected result.
  expect(fakeServer.pending()).toEqual(['like post-1 true']);
  expect(like()).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('11 likes')).toBeInTheDocument();

  await act(async () => fakeServer.resolveNext());
  expect(like()).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('11 likes')).toBeInTheDocument();
});

test('a failed save reverts to the confirmed value and explains why', async () => {
  const user = userEvent.setup();
  fakeServer.hold();
  render(<LikeButton postId="post-1" initial={{ liked: false, likes: 10 }} />);

  await user.click(like());
  expect(screen.getByText('11 likes')).toBeInTheDocument();

  await act(async () => fakeServer.rejectNext('Network down'));
  expect(like()).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('10 likes')).toBeInTheDocument();
  expect(screen.getByText('Could not save your like. Try again.')).toBeInTheDocument();
});

test('unliking a liked post fails the same way in auto mode (findBy waits for the Action)', async () => {
  const user = userEvent.setup();
  render(<LikeButton postId="post-1" initial={{ liked: true, likes: 11 }} />);

  fakeServer.failNextRequest('Network down');
  await user.click(like());

  expect(await screen.findByText('Could not save your like. Try again.')).toBeInTheDocument();
  expect(like()).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('11 likes')).toBeInTheDocument();
});
