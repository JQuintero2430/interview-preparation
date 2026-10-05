import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage, TodoList } from './NoEffectNeeded';

test('derived list updates in the same render as the toggle', async () => {
  render(
    <TodoList
      todos={[
        { id: 1, text: 'Write tests', done: true },
        { id: 2, text: 'Ship', done: false },
      ]}
    />,
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  await userEvent.click(screen.getByLabelText('Show completed'));
  expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Ship']);
});

test('a key resets the draft when the user changes', async () => {
  const { rerender } = render(<ProfilePage userId="ana" />);
  await userEvent.type(screen.getByLabelText('Comment for ana'), 'hi');
  rerender(<ProfilePage userId="bo" />);
  expect(screen.getByLabelText('Comment for bo')).toHaveValue('');
});
