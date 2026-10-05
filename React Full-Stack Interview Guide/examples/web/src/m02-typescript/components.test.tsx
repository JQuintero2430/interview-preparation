import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Alert, Box, Button, Card, FancyInput, SearchForm, Select } from './components';

describe('typed components (runtime)', () => {
  it('Button merges variant and className and forwards native props', () => {
    render(<Button variant="ghost" className="x" disabled>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('btn-ghost', 'x');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('Card renders string and element children', () => {
    render(<Card title="T">text<b>bold</b></Card>);
    expect(screen.getByRole('heading', { name: 'T' })).toBeInTheDocument();
  });

  it('Select calls onChange with the typed option, not the string key', async () => {
    const onChange = vi.fn<(value: { id: number; label: string }) => void>();
    const options = [{ id: 1, label: 'One' }, { id: 2, label: 'Two' }];
    const [first] = options;
    if (!first) throw new Error('fixture');
    render(<Select options={options} value={first} onChange={onChange} getKey={(o) => String(o.id)} getLabel={(o) => o.label} />);
    await userEvent.setup().selectOptions(screen.getByRole('combobox'), 'Two');
    expect(onChange).toHaveBeenCalledWith({ id: 2, label: 'Two' });
  });

  it('Box renders the element named by `as`', () => {
    render(<Box as="a" href="/x">link</Box>);
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', '/x');
  });

  it('FancyInput receives ref as a prop (React 19)', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FancyInput ref={ref} aria-label="name" />);
    expect(ref.current).toBe(screen.getByLabelText('name'));
  });

  it('Alert renders the shape its tag selects', () => {
    render(<Alert kind="link" href="/h">home</Alert>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/h');
  });

  it('SearchForm reads the field through the typed FormEvent', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Query'), 'ts');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('ts');
  });
});

describe('typed components (compile-time, checked by tsc)', () => {
  it('rejects props the chosen element does not have', () => {
    // @ts-expect-error - a div has no href
    render(<Box as="div" href="/x" />);
    // @ts-expect-error - 'sparkly' is not a Button variant
    render(<Button variant="sparkly" />);
    // @ts-expect-error - a 'link' Alert requires href
    render(<Alert kind="link">x</Alert>);
    // @ts-expect-error - an 'button' Alert has no href
    render(<Alert kind="button" onClick={() => {}} href="/x">x</Alert>);
  });

  it('NoInfer makes `value` conform to `options` instead of widening T', () => {
    const sizes = ['s', 'm'] as const;
    // @ts-expect-error - 'xl' is not 's' | 'm'
    render(<Select options={sizes} value="xl" onChange={() => {}} getKey={(s) => s} getLabel={(s) => s.toUpperCase()} />);
    render(<Select options={sizes} value="m" onChange={() => {}} getKey={(s) => s} getLabel={(s) => s.toUpperCase()} />);
  });
});
