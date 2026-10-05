import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

const options = ['Java', 'JavaScript', 'Python', 'TypeScript', 'Kotlin'];
const input = () => screen.getByRole('combobox', { name: 'Language' });

test('typing filters case-insensitively and opens the listbox', async () => {
  const user = userEvent.setup();
  render(<Autocomplete options={options} />);
  expect(input()).toHaveAttribute('aria-expanded', 'false');

  await user.type(input(), 'JA');

  expect(input()).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Java', 'JavaScript']);
  expect(screen.getByRole('status')).toHaveTextContent('2 results available');
});

test('arrow keys move aria-activedescendant (focus stays on the input) and wrap', async () => {
  const user = userEvent.setup();
  render(<Autocomplete options={options} />);
  await user.type(input(), 'ja');

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { name: 'Java' })).toHaveAttribute('aria-selected', 'true');
  expect(input()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Java' }).id);
  expect(input()).toHaveFocus();

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { name: 'Java' })).toHaveAttribute('aria-selected', 'true'); // wrapped
  await user.keyboard('{ArrowUp}');
  expect(screen.getByRole('option', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true');
});

test('Enter picks the highlighted option and closes the list', async () => {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<Autocomplete options={options} onSelect={onSelect} />);
  await user.type(input(), 'ja');
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

  expect(input()).toHaveValue('JavaScript');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(input()).toHaveAttribute('aria-expanded', 'false');
  expect(onSelect).toHaveBeenCalledWith('JavaScript');
});

test('Enter with nothing highlighted does not select', async () => {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<Autocomplete options={options} onSelect={onSelect} />);
  await user.type(input(), 'py{Enter}');
  expect(onSelect).not.toHaveBeenCalled();
  expect(input()).toHaveValue('py');
});

test('clicking an option selects it and keeps focus on the input', async () => {
  const user = userEvent.setup();
  render(<Autocomplete options={options} />);
  await user.type(input(), 'kot');
  await user.click(screen.getByRole('option', { name: 'Kotlin' }));

  expect(input()).toHaveValue('Kotlin');
  expect(input()).toHaveFocus();
});

test('Escape closes the list first, then clears the text', async () => {
  const user = userEvent.setup();
  render(<Autocomplete options={options} />);
  await user.type(input(), 'ja');

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(input()).toHaveValue('ja');

  await user.keyboard('{Escape}');
  expect(input()).toHaveValue('');
});

test('no matches: no listbox, and a status message', async () => {
  const user = userEvent.setup();
  render(<Autocomplete options={options} />);
  await user.type(input(), 'zzz');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('No matches');
});

test('blurring closes the list', async () => {
  const user = userEvent.setup();
  render(
    <>
      <Autocomplete options={options} />
      <button type="button">After</button>
    </>,
  );
  await user.type(input(), 'ja');
  await user.tab(); // moves focus to the other button
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
