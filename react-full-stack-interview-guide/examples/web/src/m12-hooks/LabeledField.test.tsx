import { render, screen } from '@testing-library/react';
import { LabeledField } from './LabeledField';

test('label and hint are wired to the input', () => {
  render(<LabeledField label="Email" hint="We never share it." />);
  expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it.');
});

test('two instances get different ids', () => {
  render(
    <>
      <LabeledField label="Email" hint="Work address" />
      <LabeledField label="Backup email" hint="Personal address" />
    </>,
  );
  const first = screen.getByLabelText('Email');
  const second = screen.getByLabelText('Backup email');
  expect(first.id).not.toBe(second.id);
  expect(second).toHaveAccessibleDescription('Personal address');
});

test('React 19.2+ client ids look like _r_<n>_, valid in CSS selectors', () => {
  render(<LabeledField label="Name" hint="As on your passport" />);
  const input = screen.getByLabelText('Name');
  expect(input.id).toMatch(/^_r_[0-9a-v]+_-input$/);
  expect(document.querySelector(`#${input.id}`)).toBe(input); // no CSS.escape needed
});
