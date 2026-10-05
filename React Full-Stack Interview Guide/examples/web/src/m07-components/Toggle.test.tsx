import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

const boldButton = () => screen.getByRole('button', { name: 'Bold' });

test('uncontrolled: owns its state and reports each change', async () => {
  const onChange = vi.fn();
  render(<Toggle onChange={onChange}>Bold</Toggle>);
  expect(boldButton()).toHaveAttribute('aria-pressed', 'false');

  await userEvent.click(boldButton());

  expect(boldButton()).toHaveAttribute('aria-pressed', 'true');
  expect(onChange).toHaveBeenCalledWith(true);
});

test('uncontrolled: defaultValue is read once, on mount', () => {
  const { rerender } = render(<Toggle defaultValue>Bold</Toggle>);
  rerender(<Toggle defaultValue={false}>Bold</Toggle>);
  expect(boldButton()).toHaveAttribute('aria-pressed', 'true');
});

function ControlledHost() {
  const [bold, setBold] = useState(false);
  return (
    <>
      <Toggle value={bold} onChange={setBold}>
        Bold
      </Toggle>
      <p>Bold is {bold ? 'on' : 'off'}</p>
    </>
  );
}

test('controlled: the parent owns the state', async () => {
  render(<ControlledHost />);
  await userEvent.click(boldButton());
  expect(boldButton()).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Bold is on')).toBeInTheDocument();
});

test('controlled: if the parent ignores onChange, the toggle does not move', async () => {
  const onChange = vi.fn();
  render(
    <Toggle value={false} onChange={onChange}>
      Bold
    </Toggle>,
  );

  await userEvent.click(boldButton());

  expect(onChange).toHaveBeenCalledWith(true);
  expect(boldButton()).toHaveAttribute('aria-pressed', 'false');
});
