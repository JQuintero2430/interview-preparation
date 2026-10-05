import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatToolbar } from './FormatToolbar';

const items = [
  { id: 'b', label: 'Bold' },
  { id: 'i', label: 'Italic' },
  { id: 'u', label: 'Underline' },
] as const;

function setup() {
  const user = userEvent.setup();
  render(
    <>
      <button type="button">Before</button>
      <FormatToolbar label="Text formatting" items={items} />
      <button type="button">After</button>
    </>,
  );
  return user;
}

const tabIndexes = () =>
  ['Bold', 'Italic', 'Underline'].map((n) => screen.getByRole('button', { name: n }).tabIndex);

describe('FormatToolbar (roving tabindex)', () => {
  it('has a named toolbar role and exactly one tab stop', () => {
    setup();
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    expect(tabIndexes()).toEqual([0, -1, -1]);
  });

  it('Tab enters on the first item and the next Tab leaves the whole toolbar', async () => {
    const user = setup();
    await user.tab(); // Before
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('ArrowRight/ArrowLeft move focus and the tabindex, wrapping at the ends', async () => {
    const user = setup();
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
    expect(tabIndexes()).toEqual([-1, 0, -1]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Underline' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
  });

  it('Home and End jump to the first and last item', async () => {
    const user = setup();
    await user.tab();
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Underline' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
  });

  it('remembers the last active item: tab out, shift+tab back lands on it', async () => {
    const user = setup();
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}'); // Italic
    await user.tab(); // After
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveFocus();
  });

  it('clicking an item makes it the roving stop and toggles aria-pressed', async () => {
    const user = setup();
    const underline = screen.getByRole('button', { name: 'Underline' });
    expect(underline).toHaveAttribute('aria-pressed', 'false');
    await user.click(underline);
    expect(underline).toHaveAttribute('aria-pressed', 'true');
    expect(tabIndexes()).toEqual([-1, -1, 0]);
    await user.keyboard('{Enter}');
    expect(underline).toHaveAttribute('aria-pressed', 'false');
  });
});
