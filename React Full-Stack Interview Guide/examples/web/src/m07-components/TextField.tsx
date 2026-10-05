import { forwardRef, type ComponentProps, type ComponentPropsWithoutRef } from 'react';

type Labelled = { label: string };

/** React 19: `ref` is an ordinary prop of function components, so it simply travels in the spread. */
export function TextField({ label, ...inputProps }: Labelled & ComponentProps<'input'>) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

/**
 * The React 16.3–18 way. Still works in 19; react.dev says `forwardRef` will be deprecated in a
 * future release. Migration: delete the wrapper and take `ref` from props, as `TextField` does.
 */
export const LegacyTextField = forwardRef<HTMLInputElement, Labelled & ComponentPropsWithoutRef<'input'>>(
  function LegacyTextField({ label, ...inputProps }, ref) {
    return (
      <label>
        {label}
        <input ref={ref} {...inputProps} />
      </label>
    );
  },
);
