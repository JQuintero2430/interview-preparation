import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Comments, addReply, countReplies, type CommentData } from './Comments';

const leaf = (id: number, author: string, text: string): CommentData => ({ id, author, text, replies: [] });

const initial: CommentData[] = [
  { id: 1, author: 'Ada', text: 'Hooks are great', replies: [{ ...leaf(2, 'Linus', 'Agreed'), replies: [leaf(3, 'Grace', 'Me too')] }] },
  leaf(4, 'Alan', 'What about classes?'),
];

describe('addReply', () => {
  test('inserts at any depth without mutating the input', () => {
    const before = JSON.stringify(initial);
    const next = addReply(initial, 3, leaf(9, 'You', 'deep'));

    expect(next[0]?.replies[0]?.replies[0]?.replies).toEqual([leaf(9, 'You', 'deep')]);
    expect(JSON.stringify(initial)).toBe(before);
  });

  test('leaves the other branches equal', () => {
    const next = addReply(initial, 3, leaf(9, 'You', 'deep'));
    expect(next[1]).toEqual(initial[1]);
  });

  test('countReplies counts the whole subtree', () => {
    expect(countReplies(initial[0] as CommentData)).toBe(2);
  });
});

test('renders the thread recursively', () => {
  render(<Comments initial={initial} />);
  expect(screen.getByText('Me too')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

test('replying to a nested comment adds it under that comment', async () => {
  const user = userEvent.setup();
  render(<Comments initial={initial} />);

  await user.click(screen.getByRole('button', { name: 'Reply to Grace' }));
  await user.type(screen.getByRole('textbox', { name: 'Your reply to Grace' }), 'Thanks!');
  await user.click(screen.getByRole('button', { name: 'Post reply' }));

  expect(screen.getByText('Thanks!')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument(); // the form closed
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
});

test('an empty reply is ignored', async () => {
  const user = userEvent.setup();
  render(<Comments initial={initial} />);
  await user.click(screen.getByRole('button', { name: 'Reply to Alan' }));
  await user.click(screen.getByRole('button', { name: 'Post reply' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

test('collapsing hides a whole subtree; replying to a collapsed node re-expands it', async () => {
  const user = userEvent.setup();
  render(<Comments initial={initial} />);
  const toggle = screen.getByRole('button', { name: 'Replies to Ada' });

  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveTextContent('Show 2');
  expect(screen.queryByText('Agreed')).not.toBeInTheDocument();
  expect(screen.queryByText('Me too')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Reply to Ada' }));
  await user.type(screen.getByRole('textbox', { name: 'Your reply to Ada' }), 'New one');
  await user.click(screen.getByRole('button', { name: 'Post reply' }));
  expect(screen.getByText('Agreed')).toBeInTheDocument();
  expect(screen.getByText('New one')).toBeInTheDocument();
});
