import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransformedPage } from './TransformedPage';

describe('CenteredModal inside a transformed ancestor', () => {
  it('portal: the dialog is a child of the backdrop, which is a direct child of document.body', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal />);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(screen.getByTestId('animated-ancestor')).not.toContainElement(dialog);
  });

  it('no portal: the dialog stays inside the ancestor that creates the stacking context', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal={false} />);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(screen.getByTestId('animated-ancestor')).toContainElement(dialog);
  });

  it('the ancestor really declares a transform (the cause of the trap)', () => {
    render(<TransformedPage portal />);
    expect(screen.getByTestId('animated-ancestor').style.transform).toBe('translateZ(0)');
  });

  it('exposes role=dialog, aria-modal and a name from its heading', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal />);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Settings');
  });

  it('moves focus into the dialog, then restores it to the trigger on Escape', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal />);
    const trigger = screen.getByRole('button', { name: 'Open settings' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes with the Close button and with a click on the backdrop', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal />);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    const backdrop = screen.getByRole('dialog').parentElement;
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as HTMLElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a click inside the dialog does not close it', async () => {
    const user = userEvent.setup();
    render(<TransformedPage portal />);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByText('Modal body'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
