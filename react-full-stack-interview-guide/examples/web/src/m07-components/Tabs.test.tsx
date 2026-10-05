import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

type AccountTabsProps = { value?: string; onChange?: (value: string) => void };

function AccountTabs({ value, onChange }: AccountTabsProps) {
  return (
    <Tabs value={value} defaultValue="profile" onChange={onChange}>
      <TabList label="Account">
        <Tab value="profile">Profile</Tab>
        <Tab value="billing">Billing</Tab>
        <Tab value="security">Security</Tab>
      </TabList>
      <TabPanel value="profile">Profile settings</TabPanel>
      <TabPanel value="billing">Billing settings</TabPanel>
      <TabPanel value="security">Security settings</TabPanel>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

test('exposes tablist / tab / tabpanel roles, wired together by ids', () => {
  render(<AccountTabs />);
  expect(screen.getByRole('tablist', { name: 'Account' })).toBeInTheDocument();
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  expect(tab('Profile')).toHaveAttribute('aria-selected', 'true');
  // Hidden panels are excluded from the accessibility tree, so only one is found.
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  expect(screen.getByRole('tabpanel', { name: 'Profile' })).toHaveTextContent('Profile settings');
  expect(tab('Profile')).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
});

test('clicking a tab selects it and shows its panel', async () => {
  render(<AccountTabs />);
  await userEvent.click(tab('Billing'));
  expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
  expect(tab('Profile')).toHaveAttribute('aria-selected', 'false');
  expect(screen.getByRole('tabpanel', { name: 'Billing' })).toHaveTextContent('Billing settings');
});

test('roving tabindex: only the selected tab is in the Tab order', () => {
  render(<AccountTabs />);
  expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1]);
});

test('arrow keys move focus and selection, wrapping; Home and End jump', async () => {
  render(<AccountTabs />);
  await userEvent.tab();
  expect(tab('Profile')).toHaveFocus();

  await userEvent.keyboard('{ArrowRight}');
  expect(tab('Billing')).toHaveFocus();
  expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');

  await userEvent.keyboard('{End}');
  expect(tab('Security')).toHaveFocus();

  await userEvent.keyboard('{ArrowRight}');
  expect(tab('Profile')).toHaveFocus();

  await userEvent.keyboard('{ArrowLeft}');
  expect(tab('Security')).toHaveFocus();

  await userEvent.keyboard('{Home}');
  expect(tab('Profile')).toHaveFocus();
  expect(screen.getByRole('tabpanel', { name: 'Profile' })).toBeInTheDocument();
});

test('uncontrolled: onChange is reported once per real change', async () => {
  const onChange = vi.fn();
  render(<AccountTabs onChange={onChange} />);
  await userEvent.click(tab('Billing')); // focus selects, then the click is a no-op
  await userEvent.click(tab('Billing'));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('billing');
});

function ControlledHost() {
  const [tabValue, setTabValue] = useState('security');
  return (
    <>
      <AccountTabs value={tabValue} onChange={setTabValue} />
      <p>Current: {tabValue}</p>
    </>
  );
}

test('controlled: the parent owns the selected tab', async () => {
  render(<ControlledHost />);
  expect(tab('Security')).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(tab('Billing'));
  expect(screen.getByText('Current: billing')).toBeInTheDocument();
  expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
});

test('a part used outside <Tabs> fails fast with a clear message', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Tab value="x">X</Tab>)).toThrow('<Tab> must be rendered inside <Tabs>');
  error.mockRestore();
});
