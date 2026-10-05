import { useState, type FormEvent } from 'react';

export type Values = { email: string; name: string };
type Errors = Partial<Record<keyof Values, string>>;

const STEPS = ['Account', 'Profile', 'Review'] as const;

/** Pure per-step validation: easy to unit test, and the only place the rules live. */
export function validate(step: number, values: Values): Errors {
  if (step === 0 && !/^\S+@\S+\.\S+$/.test(values.email)) return { email: 'Enter a valid email' };
  if (step === 1 && !values.name.trim()) return { name: 'Name is required' };
  return {};
}

function Field(props: {
  label: string;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
}) {
  const errorId = `${props.label}-error`;
  return (
    <div>
      <label>
        {props.label}
        <input
          value={props.value}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={props.error ? errorId : undefined}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </label>
      {props.error && (
        <p id={errorId} role="alert">
          {props.error}
        </p>
      )}
    </div>
  );
}

export function Wizard({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ email: '', name: '' }); // lives above the steps, so Back keeps it
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Errors are derived. They appear after a failed Next and vanish as soon as the field is valid.
  const errors = attempted ? validate(step, values) : {};
  const isLast = step === STEPS.length - 1;

  function goTo(next: number) {
    setStep(next);
    setAttempted(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault(); // Enter in an input submits the form: same path as the Next button
    if (Object.keys(validate(step, values)).length > 0) {
      setAttempted(true);
      return;
    }
    if (isLast) {
      onSubmit(values);
      setSubmitted(true);
    } else {
      goTo(step + 1);
    }
  }

  if (submitted) return <p role="status">Thanks, {values.name}!</p>;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Sign up">
      <p>
        Step {step + 1} of {STEPS.length}
      </p>
      <h2>{STEPS[step]}</h2>

      {step === 0 && (
        <Field label="Email" value={values.email} error={errors.email} onChange={(email) => setValues((v) => ({ ...v, email }))} />
      )}
      {step === 1 && (
        <Field label="Name" value={values.name} error={errors.name} onChange={(name) => setValues((v) => ({ ...v, name }))} />
      )}
      {isLast && (
        <dl>
          <dt>Email</dt>
          <dd>{values.email}</dd>
          <dt>Name</dt>
          <dd>{values.name}</dd>
        </dl>
      )}

      <button type="button" disabled={step === 0} onClick={() => goTo(step - 1)}>
        Back
      </button>
      <button type="submit">{isLast ? 'Submit' : 'Next'}</button>
    </form>
  );
}
