'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signup } from './actions';
import { initialSignupState } from './validate';

// useFormStatus reads the status of the PARENT <form>, so it must live in a child component.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Signing up…' : 'Sign up'}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialSignupState);

  return (
    <form action={formAction} aria-busy={isPending}>
      <label>
        Name{' '}
        {/* key resets the uncontrolled input when the server returns new values; defaultValue re-fills it after an error */}
        <input name="name" defaultValue={state.values.name} key={`name-${state.values.name}`} aria-invalid={Boolean(state.fieldErrors.name)} />
      </label>
      {state.fieldErrors.name && <p role="alert">{state.fieldErrors.name}</p>}

      <label>
        Email{' '}
        <input name="email" type="email" defaultValue={state.values.email} key={`email-${state.values.email}`} aria-invalid={Boolean(state.fieldErrors.email)} />
      </label>
      {state.fieldErrors.email && <p role="alert">{state.fieldErrors.email}</p>}

      <SubmitButton />
      {state.message && <p role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
    </form>
  );
}
