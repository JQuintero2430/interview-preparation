import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('starts collapsed: aria-expanded=false and the panel is hidden but still in the DOM', () => {
    render(<Disclosure summary="Shipping details">Ships in 3 days</Disclosure>);
    const button = screen.getByRole('button', { name: 'Shipping details' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    // display:none/hidden content has no accessible name, so query it by text, not by role
    expect(screen.getByText('Ships in 3 days')).toBeInTheDocument();
    expect(screen.getByText('Ships in 3 days')).not.toBeVisible();
  });

  it('wires aria-controls to the panel id', () => {
    render(<Disclosure summary="More">Body</Disclosure>);
    const button = screen.getByRole('button', { name: 'More' });
    const panel = screen.getByText('Body');
    expect(button.getAttribute('aria-controls')).toBeTruthy();
    expect(panel.id).toBe(button.getAttribute('aria-controls'));
  });

  it('toggles with a mouse click', async () => {
    const user = userEvent.setup();
    render(<Disclosure summary="More">Body</Disclosure>);
    const button = screen.getByRole('button', { name: 'More' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body')).toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Body')).not.toBeVisible();
  });

  it('is reachable with Tab and toggles with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<Disclosure summary="More">Body</Disclosure>);
    const button = screen.getByRole('button', { name: 'More' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus(); // focus never moves
  });

  it('honours defaultOpen', () => {
    render(
      <Disclosure summary="More" defaultOpen>
        Body
      </Disclosure>,
    );
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body')).toBeVisible();
  });
});
