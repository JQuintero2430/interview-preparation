import { fireEvent, render, screen } from '@testing-library/react';
import { ROW_HEIGHT, VIEWPORT_HEIGHT, VirtualList } from './VirtualList';

const ROWS = Array.from({ length: 10_000 }, (_, i) => `Row ${i}`);

// jsdom does no layout: every offsetHeight is 0, so the virtualizer would think the viewport
// is empty. TanStack Virtual reads the scroll element's size from offsetWidth/offsetHeight
// (and from ResizeObserver, which jsdom lacks), so stubbing the getters is enough.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(VIEWPORT_HEIGHT);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders a small window of the 10,000 rows', () => {
  render(<VirtualList rows={ROWS} />);

  // 400 px / 35 px: rows 0–11 intersect the viewport, plus 5 overscan rows below = 17.
  expect(screen.getAllByRole('listitem')).toHaveLength(17);
  expect(screen.getByText('Row 0')).toBeInTheDocument();
  expect(screen.queryByText('Row 9999')).not.toBeInTheDocument();
});

test('the inner list is as tall as all rows, so the scrollbar is correct', () => {
  render(<VirtualList rows={ROWS} />);
  expect(screen.getByRole('list', { name: 'Rows' })).toHaveStyle({ height: `${10_000 * ROW_HEIGHT}px` });
});

test('scrolling moves the window instead of adding rows', () => {
  render(<VirtualList rows={ROWS} />);
  const scroller = screen.getByTestId('scroller');

  scroller.scrollTop = 100 * ROW_HEIGHT; // row 100 at the top of the viewport
  fireEvent.scroll(scroller);

  expect(screen.getByText('Row 100')).toBeInTheDocument();
  expect(screen.queryByText('Row 0')).not.toBeInTheDocument();
  expect(screen.getAllByRole('listitem').length).toBeLessThan(30);
});

test('rows announce their position in the full list', () => {
  render(<VirtualList rows={ROWS} />);
  const first = screen.getByText('Row 0');
  expect(first).toHaveAttribute('aria-posinset', '1');
  expect(first).toHaveAttribute('aria-setsize', '10000');
});
