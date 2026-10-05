import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvatarPicker, MAX_AVATAR_BYTES, validateAvatar } from './AvatarPicker';

// jsdom does not implement object URLs, so install deterministic fakes.
const created: string[] = [];
const revoked: string[] = [];

beforeEach(() => {
  created.length = 0;
  revoked.length = 0;
  URL.createObjectURL = () => {
    const url = `blob:test/${created.length + 1}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url: string) => {
    revoked.push(url);
  };
});

const png = (name: string, bytes = 10) => new File([new Uint8Array(bytes)], name, { type: 'image/png' });
const picker = () => screen.getByLabelText('Profile picture');

test('validateAvatar checks type and size', () => {
  expect(validateAvatar(png('a.png'))).toBeNull();
  expect(validateAvatar(new File(['x'], 'a.txt', { type: 'text/plain' }))).toBe('Choose a PNG, JPEG or WebP image');
  expect(validateAvatar(png('big.png', MAX_AVATAR_BYTES + 1))).toBe('The image must be 1 MB or smaller');
});

test('a valid image is previewed through an object URL', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<AvatarPicker onChange={onChange} />);

  const file = png('me.png', 2048);
  await user.upload(picker(), file);

  expect(screen.getByRole('img', { name: 'Preview of me.png' })).toHaveAttribute('src', 'blob:test/1');
  expect(screen.getByText('me.png (2 KB)')).toBeInTheDocument();
  expect(onChange).toHaveBeenCalledWith(file);
});

test('choosing another file revokes the previous URL; unmount revokes the current one', async () => {
  const user = userEvent.setup();
  const { unmount } = render(<AvatarPicker />);

  await user.upload(picker(), png('one.png'));
  await user.upload(picker(), png('two.png'));
  expect(revoked).toEqual(['blob:test/1']);
  expect(screen.getByRole('img', { name: 'Preview of two.png' })).toHaveAttribute('src', 'blob:test/2');

  unmount();
  expect(revoked).toEqual(['blob:test/1', 'blob:test/2']);
});

test('Strict Mode: the extra cleanup/setup pair revokes one URL and leaves a live one on screen', async () => {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <AvatarPicker />
    </StrictMode>,
  );

  await user.upload(picker(), png('me.png'));
  expect(created).toEqual(['blob:test/1', 'blob:test/2']);
  expect(revoked).toEqual(['blob:test/1']);
  expect(screen.getByRole('img', { name: 'Preview of me.png' })).toHaveAttribute('src', 'blob:test/2');
});

test('an oversized file shows an error on the input and no preview', async () => {
  const user = userEvent.setup();
  render(<AvatarPicker />);

  await user.upload(picker(), png('huge.png', MAX_AVATAR_BYTES + 1));

  expect(picker()).toHaveAccessibleDescription('The image must be 1 MB or smaller');
  expect(picker()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('`accept` only filters the picker: user-event honours it by default, so the change never fires', async () => {
  const user = userEvent.setup();
  render(<AvatarPicker />);

  await user.upload(picker(), new File(['x'], 'notes.txt', { type: 'text/plain' }));

  expect(picker()).not.toHaveAccessibleDescription();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('a file that bypasses `accept` (drag and drop, scripts) is still rejected by validation', async () => {
  const user = userEvent.setup({ applyAccept: false });
  render(<AvatarPicker />);

  await user.upload(picker(), new File(['x'], 'notes.txt', { type: 'text/plain' }));

  expect(picker()).toHaveAccessibleDescription('Choose a PNG, JPEG or WebP image');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
