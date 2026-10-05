import { render, renderHook, screen } from '@testing-library/react';
import { usePrevious } from './usePrevious';

test('undefined on the first render, then the value before the last change', () => {
  const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
    initialProps: { value: 1 },
  });
  expect(result.current).toBeUndefined();

  rerender({ value: 2 });
  expect(result.current).toBe(1);

  rerender({ value: 3 });
  expect(result.current).toBe(2);
});

test('an unrelated re-render with the same value does not move it', () => {
  const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
    initialProps: { value: 1 },
  });
  rerender({ value: 2 });
  rerender({ value: 2 }); // the classic ref version would now return 2
  expect(result.current).toBe(1);
});

function Trend({ count }: { count: number }) {
  const previous = usePrevious(count);
  if (previous === undefined) return <p>Trend: none</p>;
  return <p>Trend: {count > previous ? 'up' : 'down'}</p>;
}

test('the committed output already uses the new previous value (no stale frame)', () => {
  const { rerender } = render(<Trend count={5} />);
  expect(screen.getByText('Trend: none')).toBeInTheDocument();
  rerender(<Trend count={7} />);
  expect(screen.getByText('Trend: up')).toBeInTheDocument();
  rerender(<Trend count={3} />);
  expect(screen.getByText('Trend: down')).toBeInTheDocument();
});
