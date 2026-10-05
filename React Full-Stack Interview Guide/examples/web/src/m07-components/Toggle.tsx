import type { ReactNode } from 'react';
import { useControllableState } from './useControllableState';

type ToggleProps = {
  value?: boolean; // controlled: the parent owns the state
  defaultValue?: boolean; // uncontrolled: the starting state, read once
  onChange?: (value: boolean) => void;
  children: ReactNode;
};

/** A pressed/unpressed button that works controlled (`value`) or uncontrolled (`defaultValue`). */
export function Toggle({ value, defaultValue = false, onChange, children }: ToggleProps) {
  const [on, setOn] = useControllableState({ value, defaultValue, onChange });

  return (
    <button type="button" aria-pressed={on} onClick={() => setOn(!on)}>
      {children}
    </button>
  );
}
