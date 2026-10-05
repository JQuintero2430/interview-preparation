import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { LegacyTextField, TextField } from './TextField';

test('React 19: ref passed as a plain prop reaches the input', () => {
  const ref = createRef<HTMLInputElement>();
  render(<TextField label="Email" ref={ref} />);
  expect(ref.current).toBe(screen.getByLabelText('Email'));
});

test('forwardRef still works in React 19', () => {
  const ref = createRef<HTMLInputElement>();
  render(<LegacyTextField label="Phone" ref={ref} />);
  expect(ref.current).toBe(screen.getByLabelText('Phone'));
});
