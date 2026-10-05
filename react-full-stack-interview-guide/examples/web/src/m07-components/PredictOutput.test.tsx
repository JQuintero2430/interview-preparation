import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter, IgnoredInput, Logged, NameField, ReadOnlyInput, log } from './PredictOutput';

beforeEach(() => {
  log.length = 0;
});

test('1) typing "abc" into a controlled input whose owner ignores onChange', async () => {
  render(<IgnoredInput />);
  const input = screen.getByLabelText('Ignored');
  await userEvent.type(input, 'abc');
  expect(input).toHaveValue('');
  expect(log).toEqual(['onChange a', 'onChange b', 'onChange c']);
});

test('2) typing "xyz" into an input with value but no onChange', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<ReadOnlyInput />);
  const input = screen.getByLabelText('Read-only');
  await userEvent.type(input, 'xyz');
  expect(input).toHaveValue('fixed');
  expect(String(error.mock.calls[0]?.[0])).toContain(
    'You provided a `value` prop to a form field without an `onChange` handler',
  );
  error.mockRestore();
});

test('3) changing defaultValue after mount, then changing the key', () => {
  const { rerender } = render(<NameField initial="Ada" />);
  rerender(<NameField initial="Grace" />);
  expect(screen.getByLabelText('Name')).toHaveValue('Ada');

  rerender(<NameField key="grace" initial="Grace" />);
  expect(screen.getByLabelText('Name')).toHaveValue('Grace');
});

test('4) which components re-render when Counter’s state changes', async () => {
  render(
    <Counter>
      <Logged name="slot" />
    </Counter>,
  );
  expect(log).toEqual(['render Counter 0', 'render inline', 'render slot']);

  log.length = 0;
  await userEvent.click(screen.getByRole('button', { name: 'Clicked 0' }));
  expect(log).toEqual(['render Counter 1', 'render inline']);
});
