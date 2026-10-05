import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { Chart } from './Chart';
import { widgetLog } from './widget';

beforeEach(() => {
  widgetLog.length = 0;
});

test('creates the widget once, updates it with new data, destroys it on unmount', () => {
  const { rerender, unmount } = render(<Chart data={[1, 2, 3]} />);
  expect(screen.getByTestId('chart')).toHaveTextContent('Chart: 1, 2, 3');

  rerender(<Chart data={[4, 5]} />);
  expect(screen.getByTestId('chart')).toHaveTextContent('Chart: 4, 5');

  unmount();
  expect(widgetLog).toEqual(['create', 'update 1,2,3', 'update 4,5', 'destroy']);
});

test('re-rendering with the same array reference does not touch the widget', () => {
  const data = [1, 2, 3];
  const { rerender } = render(<Chart data={data} />);
  rerender(<Chart data={data} />);
  expect(widgetLog).toEqual(['create', 'update 1,2,3']);
});

test('Strict Mode (dev): destroy and re-create once; one live widget remains', () => {
  render(
    <StrictMode>
      <Chart data={[1, 2, 3]} />
    </StrictMode>,
  );
  expect(widgetLog).toEqual(['create', 'update 1,2,3', 'destroy', 'create', 'update 1,2,3']);
  expect(screen.getByTestId('chart')).toHaveTextContent('Chart: 1, 2, 3');
});
