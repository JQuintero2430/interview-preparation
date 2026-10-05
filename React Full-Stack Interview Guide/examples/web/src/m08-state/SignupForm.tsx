import { useId, useState, type ChangeEvent } from 'react';
import {
  emptySignup,
  hasNoErrors,
  validateSignup,
  type SignupField,
  type SignupValues,
} from './signupValidation';

type Props = { onSubmit: (values: SignupValues) => void };

/** Signup form whose errors and validity are derived from the values, never stored. */
export function SignupForm({ onSubmit }: Props) {
  const [values, setValues] = useState(emptySignup);
  const [touched, setTouched] = useState<Partial<Record<SignupField, boolean>>>({});

  // Derived on every render: cheap, and always consistent with `values`.
  const errors = validateSignup(values);
  const canSubmit = hasNoErrors(errors);

  const change = (field: SignupField) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target; // read the event now; the updater may run later (or twice in dev)
    setValues((v) => ({ ...v, [field]: value }));
  };
  const blur = (field: SignupField) => () => setTouched((t) => ({ ...t, [field]: true }));
  const fieldProps = (name: SignupField) => ({
    value: values[name],
    error: touched[name] ? errors[name] : undefined, // show only after the user has left the field
    onChange: change(name),
    onBlur: blur(name),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(values);
      }}
    >
      <TextField label="Email" type="email" {...fieldProps('email')} />
      <TextField label="Password" type="password" {...fieldProps('password')} />
      <TextField label="Confirm password" type="password" {...fieldProps('confirm')} />
      <button type="submit" disabled={!canSubmit}>
        Sign up
      </button>
    </form>
  );
}

type TextFieldProps = {
  label: string;
  type: 'email' | 'password';
  value: string;
  error: string | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
};

function TextField({ label, error, ...input }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        {...input}
        aria-invalid={error !== undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
