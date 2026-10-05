import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Typeahead } from './Typeahead';
import type { SearchFn } from './useTypeaheadResults';

type Call = {
  query: string;
  signal: AbortSignal;
  resolve: (items: string[]) => void;
  reject: (e: Error) => void;
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

const wait = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

function setup() {
  const calls: Call[] = [];
  const search: SearchFn = (query, signal) =>
    new Promise<string[]>((resolve, reject) => {
      calls.push({ query, signal, resolve, reject });
    });
  const onSelect = vi.fn();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Typeahead label="City" search={search} onSelect={onSelect} delayMs={300} />);
  const input = screen.getByRole('combobox', { name: 'City' });
  return { calls, onSelect, user, input };
}

const optionNames = () => screen.queryAllByRole('option').map((o) => o.textContent);

test('debounces: typing three characters sends one request', async () => {
  const { calls, user, input } = setup();
  await user.type(input, 'par');
  expect(calls).toHaveLength(0);
  await wait(300);
  expect(calls.map((c) => c.query)).toEqual(['par']);
});

test('clearing before the delay sends nothing', async () => {
  const { calls, user, input } = setup();
  await user.type(input, 'a');
  await user.clear(input);
  await wait(300);
  expect(calls).toHaveLength(0);
});

test('a late answer for an older query never overwrites the newer one', async () => {
  const { calls, user, input } = setup();
  await user.type(input, 'a');
  await wait(300);
  await user.type(input, 'b');
  await wait(300);
  const first = calls.find((c) => c.query === 'a');
  const second = calls.find((c) => c.query === 'ab');
  expect(first?.signal.aborted).toBe(true);
  expect(second?.signal.aborted).toBe(false);

  await act(async () => second?.resolve(['Abbeville']));
  expect(optionNames()).toEqual(['Abbeville']);

  await act(async () => first?.resolve(['Aachen', 'Aalborg'])); // arrives late
  expect(optionNames()).toEqual(['Abbeville']);
});

test('keyboard: arrows move aria-activedescendant and wrap, Enter selects, focus stays on the input', async () => {
  const { calls, onSelect, user, input } = setup();
  await user.type(input, 'par');
  await wait(300);
  await act(async () => calls[0]?.resolve(['Paris', 'Parma', 'Parry']));
  expect(input).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{ArrowDown}');
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Paris' }).id);
  expect(screen.getByRole('option', { name: 'Paris' })).toHaveAttribute('aria-selected', 'true');

  await user.keyboard('{ArrowUp}'); // wraps to the last option
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Parry' }).id);
  await user.keyboard('{ArrowDown}'); // wraps to the first
  await user.keyboard('{ArrowDown}');
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Parma' }).id);
  expect(input).toHaveFocus();

  await user.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalledWith('Parma');
  expect(input).toHaveValue('Parma');
  expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('Escape closes the list first, and clears the text on the second press', async () => {
  const { calls, user, input } = setup();
  await user.type(input, 'par');
  await wait(300);
  await act(async () => calls[0]?.resolve(['Paris']));
  expect(input).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{Escape}');
  expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(input).toHaveValue('par');

  await user.keyboard('{Escape}');
  expect(input).toHaveValue('');
});

test('announces empty and failed searches in the live region', async () => {
  const { calls, user, input } = setup();
  await user.type(input, 'zz');
  await wait(300);
  await act(async () => calls[0]?.resolve([]));
  expect(screen.getByRole('status')).toHaveTextContent('No results');

  await user.type(input, 'z');
  await wait(300);
  await act(async () => calls[1]?.reject(new Error('Server unavailable')));
  expect(screen.getByRole('status')).toHaveTextContent('Server unavailable');
});
