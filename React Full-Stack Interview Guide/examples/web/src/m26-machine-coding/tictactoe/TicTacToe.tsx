import { useState } from 'react';

type Mark = 'X' | 'O';
type Squares = Array<Mark | null>;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
] as const;

export function calculateWinner(squares: Squares): { winner: Mark; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const mark = squares[a];
    if (mark && mark === squares[b] && mark === squares[c]) return { winner: mark, line };
  }
  return null;
}

export function TicTacToe() {
  const [squares, setSquares] = useState<Squares>(Array<Mark | null>(9).fill(null));

  // Everything else is derived from `squares`: no "xIsNext", "winner" or "isDraw" state to keep in sync.
  const result = calculateWinner(squares);
  const filled = squares.filter(Boolean).length;
  const next: Mark = filled % 2 === 0 ? 'X' : 'O';
  const status = result ? `Winner: ${result.winner}` : filled === 9 ? 'Draw' : `Next player: ${next}`;

  function play(index: number) {
    if (squares[index] || result) return; // occupied cell or finished game: ignore
    setSquares(squares.map((mark, i) => (i === index ? next : mark)));
  }

  return (
    <div>
      <p role="status">{status}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 3rem)' }}>
        {squares.map((mark, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Cell ${index + 1}, ${mark ?? 'empty'}`}
            data-winning={result?.line.includes(index) ?? false}
            onClick={() => play(index)}
          >
            {mark}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setSquares(Array<Mark | null>(9).fill(null))}>
        Reset
      </button>
    </div>
  );
}
