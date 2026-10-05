import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicTacToe, calculateWinner } from './TicTacToe';

const cell = (n: number, mark = 'empty') => screen.getByRole('button', { name: `Cell ${n}, ${mark}` });

async function playMoves(moves: number[]) {
  const user = userEvent.setup();
  render(<TicTacToe />);
  for (const move of moves) await user.click(screen.getByRole('button', { name: new RegExp(`^Cell ${move},`) }));
  return user;
}

test('calculateWinner finds rows, columns and diagonals', () => {
  expect(calculateWinner(['X', 'X', 'X', null, null, null, null, null, null])?.line).toEqual([0, 1, 2]);
  expect(calculateWinner(['O', null, null, 'O', null, null, 'O', null, null])?.winner).toBe('O');
  expect(calculateWinner(['X', null, 'O', null, 'X', null, 'O', null, 'X'])?.line).toEqual([0, 4, 8]);
  expect(calculateWinner(Array(9).fill(null))).toBeNull();
});

test('X starts and the players alternate', async () => {
  await playMoves([1, 2]);
  expect(cell(1, 'X')).toBeInTheDocument();
  expect(cell(2, 'O')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
});

test('an occupied cell cannot be overwritten', async () => {
  const user = await playMoves([1]);
  await user.click(cell(1, 'X'));
  expect(cell(1, 'X')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Next player: O');
});

test('announces the winner, highlights the line and locks the board', async () => {
  const user = await playMoves([1, 4, 2, 5, 3]);
  expect(screen.getByRole('status')).toHaveTextContent('Winner: X');
  expect(cell(1, 'X')).toHaveAttribute('data-winning', 'true');
  expect(cell(4, 'O')).toHaveAttribute('data-winning', 'false');

  await user.click(cell(9));
  expect(cell(9)).toBeInTheDocument(); // still empty
});

test('detects a draw', async () => {
  await playMoves([1, 2, 3, 5, 4, 6, 8, 7, 9]);
  expect(screen.getByRole('status')).toHaveTextContent('Draw');
});

test('Reset starts a new game', async () => {
  const user = await playMoves([1, 4, 2, 5, 3]);
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
  expect(cell(1)).toBeInTheDocument();
});
