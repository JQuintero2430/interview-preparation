import { useId, type HTMLInputTypeAttribute } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type Props = {
  label: string;
  registration: UseFormRegisterReturn;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  hint?: string;
  error?: string;
};

/**
 * An accessible input for React Hook Form: a real <label>, the hint and the error linked with
 * aria-describedby, aria-invalid while the error is shown, and the error in a polite live region.
 * `registration` is register('name'), which supplies name, onChange, onBlur and the ref RHF uses
 * to read the value and to move focus to the first invalid field.
 */
export function FormField({ label, registration, type = 'text', autoComplete, hint, error }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...registration}
      />
      {hint && <p id={hintId}>{hint}</p>}
      {error && (
        <p id={errorId} role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
