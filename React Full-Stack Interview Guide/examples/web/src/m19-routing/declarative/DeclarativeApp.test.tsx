import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { DeclarativeApp } from './DeclarativeApp';

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <DeclarativeApp />
    </MemoryRouter>,
  );
}

test('a deep link renders the layout plus the matched child; params come from the URL', () => {
  renderAt('/users/2');
  expect(screen.getByRole('heading', { name: 'User 2' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
});

test('NavLink marks the active link with aria-current="page"; `end` keeps Home from matching everything', async () => {
  const user = userEvent.setup();
  renderAt('/');
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

  await user.click(screen.getByRole('link', { name: 'Ada' }));

  // No loaders to wait for, but the router still updates inside a React transition: use findBy.
  expect(await screen.findByRole('heading', { name: 'User 1' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ada' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});

test('the splat route catches unknown URLs inside the layout', () => {
  renderAt('/nowhere/at/all');
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
});
