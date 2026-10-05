import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, ForceTheme, ThemedPanel, ThemeProvider, ThemeToggleButton } from './Theme';

function App() {
  return (
    <ThemeProvider>
      <ThemedPanel title="Outer">
        <ThemeToggleButton />
        <ForceTheme theme="dark">
          <ThemedPanel title="Always dark">
            <ThemeToggleButton />
          </ThemedPanel>
        </ForceTheme>
      </ThemedPanel>
    </ThemeProvider>
  );
}

test('the toggle switches every consumer under the provider', async () => {
  const user = userEvent.setup();
  render(<App />);
  const outer = screen.getByRole('region', { name: 'Outer' });
  expect(outer).toHaveAttribute('data-theme', 'light');

  // Scope the query: the nested panel has its own toggle button.
  const outerToggle = within(outer).getAllByRole('button')[0] as HTMLElement;
  expect(outerToggle).toHaveTextContent('Switch to dark theme');
  await user.click(outerToggle);

  expect(outer).toHaveAttribute('data-theme', 'dark');
  expect(outerToggle).toHaveTextContent('Switch to light theme');
});

test('a nested provider overrides the value for its subtree only', async () => {
  const user = userEvent.setup();
  render(<App />);
  const outer = screen.getByRole('region', { name: 'Outer' });
  const nested = screen.getByRole('region', { name: 'Always dark' });
  expect(nested).toHaveAttribute('data-theme', 'dark');

  // The nested toggle calls the OUTER toggleTheme (ForceTheme spreads the outer value).
  await user.click(within(nested).getByRole('button'));
  expect(outer).toHaveAttribute('data-theme', 'dark');
  expect(nested).toHaveAttribute('data-theme', 'dark');
});

test('outside any provider, consumers get the createContext default and the toggle is a no-op', async () => {
  const user = userEvent.setup();
  render(
    <ThemedPanel title="Orphan">
      <ThemeToggleButton />
    </ThemedPanel>,
  );
  const panel = screen.getByRole('region', { name: 'Orphan' });
  expect(panel).toHaveAttribute('data-theme', 'light');

  await user.click(within(panel).getByRole('button', { name: 'Switch to dark theme' }));
  expect(panel).toHaveAttribute('data-theme', 'light');
});

test('initialTheme seeds the provider state', () => {
  render(
    <ThemeProvider initialTheme="dark">
      <ThemedPanel title="Seeded" />
    </ThemeProvider>,
  );
  expect(screen.getByRole('region', { name: 'Seeded' })).toHaveAttribute('data-theme', 'dark');
});

test('use(ThemeContext) can be called after an early return', () => {
  render(
    <ThemeProvider initialTheme="dark">
      <Badge label="plain" themed={false} />
      <Badge label="themed" />
    </ThemeProvider>,
  );
  expect(screen.getByText('plain')).not.toHaveAttribute('data-theme');
  expect(screen.getByText('themed')).toHaveAttribute('data-theme', 'dark');
});
