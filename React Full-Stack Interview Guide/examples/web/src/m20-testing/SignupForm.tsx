import { useId, useState, type SubmitEvent } from 'react';

export type SignupValues = { email: string; password: string };
export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;
export const MESSAGES = {
  email: 'Enter a valid email',
  password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
} as const;

/**
 * Pure validation, so it can be unit-tested without rendering.
 * @param values - What the user submitted.
 * @returns One message per invalid field, keys in field order; `{}` when everything is valid.
 */
export function validate(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  if (!EMAIL_PATTERN.test(values.email)) errors.email = MESSAGES.email;
  if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = MESSAGES.password;
  return errors;
}

type FieldProps = {
  id: string;
  label: string;
  name: keyof SignupValues;
  type: 'email' | 'password';
  autoComplete: string;
  error: string | undefined;
};

/** A labelled input whose error message is its accessible description while it is shown. */
function Field({ id, label, name, type, autoComplete, error }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
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

/**
 * Uncontrolled sign-up form. Validates on submit, links each error to its field with
 * aria-describedby, moves focus to the first invalid field, and calls `onSubmit` only when valid.
 * @param props.onSubmit - Receives the values once they pass `validate`.
 */
export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
  const [errors, setErrors] = useState<SignupErrors>({});
  const id = useId();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: SignupValues = {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as (keyof SignupValues)[])[0];
    if (firstInvalid) {
      // Focus by field name: the error attributes are not in the DOM until the next render.
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }
    onSubmit(values);
  }

  return (
    <form aria-label="Sign up" noValidate onSubmit={handleSubmit}>
      <Field id={`${id}-email`} label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <Field
        id={`${id}-password`}
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={errors.password}
      />
      <button type="submit">Create account</button>
    </form>
  );
}
