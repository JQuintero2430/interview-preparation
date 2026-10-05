import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

test('places each slot in its region and names the article by its title', async () => {
  const onEdit = vi.fn();
  render(
    <Card title="Invoice #42" actions={<button onClick={onEdit}>Edit</button>} footer={<small>Due in 7 days</small>}>
      <p>Total: 120 EUR</p>
    </Card>,
  );

  const card = screen.getByRole('article', { name: 'Invoice #42' });
  expect(within(card).getByRole('heading', { level: 3 })).toHaveTextContent('Invoice #42');
  expect(within(card).getByText('Total: 120 EUR')).toBeInTheDocument();
  expect(within(card).getByText('Due in 7 days').closest('footer')).not.toBeNull();

  // The slot content is the caller's element, so the caller's handler still runs.
  await userEvent.click(within(card).getByRole('button', { name: 'Edit' }));
  expect(onEdit).toHaveBeenCalledTimes(1);
});

test('omits optional slots entirely when they are not provided', () => {
  const { container } = render(
    <Card title="Empty">
      <p>Body only</p>
    </Card>,
  );
  expect(container.querySelector('footer')).toBeNull();
  expect(container.querySelector('.card-actions')).toBeNull();
});

test('a slot accepts any ReactNode, including rich JSX for the title', () => {
  render(
    <Card
      title={
        <>
          Order <em>pending</em>
        </>
      }
    >
      <p>…</p>
    </Card>,
  );
  expect(screen.getByRole('article', { name: 'Order pending' })).toBeInTheDocument();
});
