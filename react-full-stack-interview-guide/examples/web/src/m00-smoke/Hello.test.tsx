import { render, screen } from '@testing-library/react';
import { Hello } from './Hello';

test('renders the greeting', () => {
  render(<Hello name="React" />);
  expect(screen.getByRole('heading', { name: 'Hello, React' })).toBeInTheDocument();
});
