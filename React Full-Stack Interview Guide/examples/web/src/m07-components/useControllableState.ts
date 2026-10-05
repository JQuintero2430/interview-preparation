import { useState } from 'react';

type Options<T> = {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
};

/**
 * State that a parent may own (controlled, via `value`) or leave to the component
 * (uncontrolled, seeded once from `defaultValue`). `onChange` hears every real change either way.
 * Returns `[current, setValue]`.
 */
export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = value === undefined ? internal : value;

  const setValue = (next: T) => {
    if (Object.is(next, current)) return; // no-op changes are not reported
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
