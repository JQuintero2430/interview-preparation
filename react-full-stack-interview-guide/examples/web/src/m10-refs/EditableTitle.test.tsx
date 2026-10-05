import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTitle } from './EditableTitle';

test('entering edit mode focuses the input and selects its text', async () => {
  const user = userEvent.setup();
  render(<EditableTitle initialTitle="Quarterly report" />);

  await user.click(screen.getByRole('button', { name: 'Edit title' }));

  const input = screen.getByRole('textbox', { name: 'Title' });
  expect(input).toHaveFocus();
  expect(input).toHaveValue('Quarterly report');
  expect((input as HTMLInputElement).selectionStart).toBe(0);
  expect((input as HTMLInputElement).selectionEnd).toBe('Quarterly report'.length);
});

test('saving updates the heading and returns focus to the Edit button', async () => {
  const user = userEvent.setup();
  render(<EditableTitle initialTitle="Quarterly report" />);

  await user.click(screen.getByRole('button', { name: 'Edit title' }));
  const input = screen.getByRole('textbox', { name: 'Title' });
  await user.clear(input);
  await user.type(input, 'Annual report{Enter}');

  expect(screen.getByRole('heading', { name: 'Annual report' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit title' })).toHaveFocus();
});

test('Escape cancels the edit and returns focus to the Edit button', async () => {
  const user = userEvent.setup();
  render(<EditableTitle initialTitle="Quarterly report" />);

  await user.click(screen.getByRole('button', { name: 'Edit title' }));
  await user.type(screen.getByRole('textbox', { name: 'Title' }), ' draft');
  await user.keyboard('{Escape}');

  expect(screen.getByRole('heading', { name: 'Quarterly report' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit title' })).toHaveFocus();
});
