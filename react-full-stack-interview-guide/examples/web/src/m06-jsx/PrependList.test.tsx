import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrependList } from './PrependList';

async function typeIntoAlphaThenPrepend() {
  await userEvent.type(screen.getByLabelText('Note for Alpha'), 'remember me');
  await userEvent.click(screen.getByRole('button', { name: 'Add to top' }));
}

test('index keys: the typed text stays at position 0 and now belongs to the wrong row', async () => {
  render(<PrependList keyBy="index" />);
  await typeIntoAlphaThenPrepend();
  expect(screen.getByLabelText('Note for New 3')).toHaveValue('remember me');
  expect(screen.getByLabelText('Note for Alpha')).toHaveValue('');
});

test('stable id keys: the typed text moves with its row', async () => {
  render(<PrependList keyBy="id" />);
  await typeIntoAlphaThenPrepend();
  expect(screen.getByLabelText('Note for Alpha')).toHaveValue('remember me');
  expect(screen.getByLabelText('Note for New 3')).toHaveValue('');
});

test('with stable keys React moves the existing DOM node instead of rewriting it', async () => {
  render(<PrependList keyBy="id" />);
  const alphaBefore = screen.getByLabelText('Note for Alpha');
  await userEvent.click(screen.getByRole('button', { name: 'Add to top' }));
  expect(screen.getByLabelText('Note for Alpha')).toBe(alphaBefore);
});
