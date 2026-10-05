import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { TeaSet } from './TeaSet';

const servedAt = new Date('2026-10-03T16:00:00.000Z');

test('Strict Mode double rendering does not change the output of a pure component', () => {
  render(
    <StrictMode>
      <TeaSet guests={['Grace', 'Ada', 'Linus']} servedAt={servedAt} />
    </StrictMode>,
  );
  expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
    'Cup #1 for Ada',
    'Cup #2 for Grace',
    'Cup #3 for Linus',
  ]);
  expect(screen.getByText('Served at 2026-10-03T16:00:00.000Z')).toBeInTheDocument();
});

test('it never mutates the guests prop (a frozen array would make sort() throw)', () => {
  const guests = Object.freeze(['Grace', 'Ada']);
  render(<TeaSet guests={guests} servedAt={servedAt} />);
  expect(guests).toEqual(['Grace', 'Ada']);
});

test('idempotent: rendering the same props twice yields identical markup', () => {
  const first = render(<TeaSet guests={['Bo', 'Al']} servedAt={servedAt} />);
  const html = first.container.innerHTML;
  first.unmount();

  const second = render(<TeaSet guests={['Bo', 'Al']} servedAt={servedAt} />);
  expect(second.container.innerHTML).toBe(html);
});
