import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { track } from './analytics';
import { CopyLinkButton } from './CopyLinkButton';

// Automock: no factory, so every export of ./analytics becomes a vi.fn() that returns undefined.
// Hoisted above the imports, so CopyLinkButton imports the mock too.
vi.mock('./analytics');

const URL_TO_COPY = 'https://example.test/posts/1';

test('copies the url, tracks the event, and confirms', async () => {
  const user = userEvent.setup(); // also installs a clipboard stub on navigator
  render(<CopyLinkButton url={URL_TO_COPY} />);

  await user.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Copied!');
  await expect(navigator.clipboard.readText()).resolves.toBe(URL_TO_COPY);
  expect(vi.mocked(track)).toHaveBeenCalledExactlyOnceWith('link_copied', { url: URL_TO_COPY });
});

test('call history does not leak between tests (clearMocks is on by default in Vitest 5)', () => {
  expect(track).not.toHaveBeenCalled();
});

test('vi.spyOn makes the clipboard fail: the error is shown and nothing is tracked', async () => {
  const user = userEvent.setup();
  // Spy after setup(): setup() is what puts the stub on navigator.clipboard.
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'));
  render(<CopyLinkButton url={URL_TO_COPY} />);

  await user.click(screen.getByRole('button', { name: 'Copy link' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not copy the link');
  expect(writeText).toHaveBeenCalledExactlyOnceWith(URL_TO_COPY);
  expect(track).not.toHaveBeenCalled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
