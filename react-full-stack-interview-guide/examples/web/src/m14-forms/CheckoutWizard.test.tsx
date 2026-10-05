import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutWizard } from './CheckoutWizard';

const heading = () => screen.getByRole('heading', { level: 2 });

test('Next validates only the current step and focuses its first invalid field', async () => {
  const user = userEvent.setup();
  render(<CheckoutWizard onComplete={() => {}} />);

  await user.click(screen.getByRole('button', { name: 'Next' }));

  const email = screen.getByLabelText('Email');
  await waitFor(() => expect(email).toHaveAccessibleDescription('Enter a valid email'));
  expect(email).toHaveFocus();
  expect(heading()).toHaveTextContent('Step 1 of 2: Contact');
});

test('values survive going back, and the final submit receives every step (trimmed by the schema)', async () => {
  const user = userEvent.setup();
  const onComplete = vi.fn();
  render(<CheckoutWizard onComplete={onComplete} />);

  await user.type(screen.getByLabelText('Email'), 'ana@example.com');
  await user.keyboard('{Enter}'); // Enter means "Next" on an intermediate step
  await waitFor(() => expect(heading()).toHaveTextContent('Step 2 of 2: Shipping'));

  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(heading()).toHaveTextContent('Step 2 of 2: Shipping'));

  await user.type(screen.getByLabelText('Full name'), '  Ana Silva ');
  await user.type(screen.getByLabelText('Address'), '1 Main Street');
  await user.click(screen.getByRole('button', { name: 'Place order' }));

  await waitFor(() =>
    expect(onComplete).toHaveBeenCalledWith(
      { email: 'ana@example.com', fullName: 'Ana Silva', address: '1 Main Street' },
      expect.anything(),
    ),
  );
});

test('the last step reports its own errors', async () => {
  const user = userEvent.setup();
  render(<CheckoutWizard onComplete={() => {}} />);

  await user.type(screen.getByLabelText('Email'), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(heading()).toHaveTextContent('Step 2 of 2: Shipping'));

  await user.type(screen.getByLabelText('Address'), '1 Ma');
  await user.click(screen.getByRole('button', { name: 'Place order' }));

  await waitFor(() =>
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription('Enter your full name'),
  );
  expect(screen.getByLabelText('Address')).toHaveAccessibleDescription('Enter a street address');
});
