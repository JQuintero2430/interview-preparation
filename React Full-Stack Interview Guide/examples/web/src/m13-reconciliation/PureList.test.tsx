import { render, screen } from '@testing-library/react';
import { PureList, renders } from './PureList';

beforeEach(() => {
  renders.length = 0;
});

test('same array reference: PureComponent skips render', () => {
  const items = ['a', 'b'];
  const { rerender } = render(<PureList items={items} />);
  rerender(<PureList items={items} />);
  expect(renders).toEqual(['a,b']);
});

test('mutating the array in place: still skipped, so the screen goes stale', () => {
  const items = ['a', 'b'];
  const { rerender } = render(<PureList items={items} />);
  items.push('c'); // ❌ mutation: same reference, shallow compare sees "no change"
  rerender(<PureList items={items} />);
  expect(renders).toEqual(['a,b']);
  expect(screen.queryByText('c')).not.toBeInTheDocument();
});

test('a new array: shallow compare sees the change and it re-renders', () => {
  const items = ['a', 'b'];
  const { rerender } = render(<PureList items={items} />);
  rerender(<PureList items={[...items, 'c']} />);
  expect(renders).toEqual(['a,b', 'a,b,c']);
  expect(screen.getByText('c')).toBeInTheDocument();
});
