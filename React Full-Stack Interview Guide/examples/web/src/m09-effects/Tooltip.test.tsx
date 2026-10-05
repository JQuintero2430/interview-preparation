import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

test('positions itself above the target using the measured height', () => {
  // jsdom has no layout engine, so we stub the measurement.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 40 } as DOMRect);
  render(<Tooltip targetTop={100}>Hello</Tooltip>);
  expect(screen.getByRole('tooltip')).toHaveStyle({ top: '60px' });
  vi.restoreAllMocks();
});
