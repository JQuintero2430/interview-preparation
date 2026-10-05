import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FastList, SlowList, filterLog, makeItems, rowLog } from './SlowList';

// 300 rows keep the suite quick in jsdom; the ratios are what matter, not the absolute size.
const ITEMS = makeItems(300);

function resetLogs() {
  rowLog.length = 0;
  filterLog.length = 0;
}

beforeEach(resetLogs);

// getByText is used for the rows instead of getByRole: role queries over hundreds of
// elements compute accessible names for each one and are slow in jsdom.

describe('SlowList (before)', () => {
  test('selecting one row re-renders all of them', async () => {
    const user = userEvent.setup();
    render(<SlowList items={ITEMS} />);
    resetLogs();

    await user.click(screen.getByText('Item 5'));

    expect(screen.getByText('Item 5')).toHaveAttribute('aria-pressed', 'true');
    expect(rowLog).toHaveLength(300);
  });

  test('an unrelated state change re-runs the filter and re-renders every row', async () => {
    const user = userEvent.setup();
    render(<SlowList items={ITEMS} />);
    resetLogs();

    await user.click(screen.getByText('Toggle theme'));

    expect(filterLog).toEqual(['']);
    expect(rowLog).toHaveLength(300);
  });
});

describe('FastList (after)', () => {
  test('selecting a row re-renders only the rows whose selected flag changed', async () => {
    const user = userEvent.setup();
    render(<FastList items={ITEMS} />);
    resetLogs();

    await user.click(screen.getByText('Item 5'));
    expect(rowLog).toEqual([5]);

    resetLogs();
    await user.click(screen.getByText('Item 7'));
    expect(rowLog).toEqual([5, 7]); // 5 is deselected, 7 is selected, in tree order
    expect(screen.getByText('Item 7')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Item 5')).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking the selected row again deselects it', async () => {
    const user = userEvent.setup();
    render(<FastList items={ITEMS} />);

    await user.click(screen.getByText('Item 5'));
    await user.click(screen.getByText('Item 5'));

    expect(screen.getByText('Item 5')).toHaveAttribute('aria-pressed', 'false');
  });

  test('an unrelated state change neither re-filters nor re-renders rows', async () => {
    const user = userEvent.setup();
    render(<FastList items={ITEMS} />);
    resetLogs();

    await user.click(screen.getByText('Toggle theme'));

    expect(filterLog).toEqual([]);
    expect(rowLog).toEqual([]);
  });

  test('filtering still works', async () => {
    const user = userEvent.setup();
    render(<FastList items={ITEMS} />);

    await user.type(screen.getByLabelText('Filter'), '29');

    // 29, 129, 229 and 290–299
    const list = screen.getByRole('list', { name: 'Items' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(13);
  });
});
