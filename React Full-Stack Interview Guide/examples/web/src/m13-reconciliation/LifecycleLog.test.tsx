import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Parent, log } from './LifecycleLog';

beforeEach(() => {
  log.length = 0;
});

test('mount: constructor → getDerivedStateFromProps → render top-down, then componentDidMount child-first', () => {
  render(<Parent value={1} />);
  expect(log).toEqual([
    'Parent constructor',
    'Parent getDerivedStateFromProps',
    'Parent render',
    'Child constructor',
    'Child getDerivedStateFromProps',
    'Child render',
    'Child componentDidMount',
    'Parent componentDidMount',
  ]);
});

test('update from new props: render phase top-down, snapshots child-first, then componentDidUpdate child-first', () => {
  const { rerender } = render(<Parent value={1} />);
  log.length = 0;
  rerender(<Parent value={2} />);
  expect(log).toEqual([
    'Parent getDerivedStateFromProps',
    'Parent shouldComponentUpdate true',
    'Parent render',
    'Child getDerivedStateFromProps',
    'Child shouldComponentUpdate true',
    'Child render',
    'Child getSnapshotBeforeUpdate',
    'Parent getSnapshotBeforeUpdate',
    'Child componentDidUpdate',
    'Parent componentDidUpdate',
  ]);
  expect(screen.getByText('Value: 2')).toBeInTheDocument();
});

test('update from parent setState: the child returns false from shouldComponentUpdate and skips the rest', async () => {
  const user = userEvent.setup();
  render(<Parent value={1} />);
  log.length = 0;
  await user.click(screen.getByRole('button', { name: 'Tick 0' }));
  expect(log).toEqual([
    'Parent getDerivedStateFromProps',
    'Parent shouldComponentUpdate true',
    'Parent render',
    'Child getDerivedStateFromProps',
    'Child shouldComponentUpdate false',
    'Parent getSnapshotBeforeUpdate',
    'Parent componentDidUpdate',
  ]);
});

test('unmount: componentWillUnmount runs parent-first', () => {
  const { unmount } = render(<Parent value={1} />);
  log.length = 0;
  unmount();
  expect(log).toEqual(['Parent componentWillUnmount', 'Child componentWillUnmount']);
});
