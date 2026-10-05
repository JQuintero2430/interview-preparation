import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagEditor } from './TagEditor';

const tags = () =>
  within(screen.getByRole('list', { name: 'Tags' }))
    .queryAllByRole('listitem')
    .map((li) => li.querySelector('span')?.textContent);

const button = (name: string) => screen.getByRole('button', { name });

test('undo and redo walk the history; a new edit clears the redo stack', async () => {
  const user = userEvent.setup();
  render(<TagEditor />);
  const input = screen.getByLabelText('New tag');

  await user.type(input, 'react{Enter}');
  await user.type(input, 'java{Enter}');
  expect(tags()).toEqual(['react', 'java']);

  await user.click(button('Undo'));
  await user.click(button('Undo'));
  expect(tags()).toEqual([]);
  expect(button('Undo')).toBeDisabled();

  await user.click(button('Redo'));
  expect(tags()).toEqual(['react']);

  await user.type(input, 'spring{Enter}');
  expect(tags()).toEqual(['react', 'spring']);
  expect(button('Redo')).toBeDisabled();
});

test('removing is undoable, and the draft text is not part of the history', async () => {
  const user = userEvent.setup();
  render(<TagEditor />);
  const input = screen.getByLabelText('New tag');

  await user.type(input, 'react{Enter}');
  await user.click(button('Remove react'));
  await user.type(input, 'half-typed');
  await user.click(button('Undo'));

  expect(tags()).toEqual(['react']);
  expect(input).toHaveValue('half-typed');
});
