import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import * as z from 'zod';
import { subscribe } from './api';

export type SubscribeState =
  | { status: 'idle' }
  | { status: 'success'; email: string }
  | { status: 'error'; email: string; message: string };

const INITIAL_STATE: SubscribeState = { status: 'idle' };
const emailSchema = z.email({ error: 'Enter a valid email' });

/**
 * The reducer-like Action: (previous state, FormData) → next state.
 * It returns errors as state instead of throwing; a throw would go to the nearest error boundary.
 */
export async function subscribeAction(_previous: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: 'error', email, message: parsed.error.issues[0]?.message ?? 'Enter a valid email' };
  }
  try {
    await subscribe(parsed.data);
    return { status: 'success', email: parsed.data };
  } catch (error) {
    return { status: 'error', email, message: error instanceof Error ? error.message : 'Something went wrong' };
  }
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeAction, INITIAL_STATE);
  const id = useId();
  const errorId = `${id}-error`;
  const error = state.status === 'error' ? state : null;

  return (
    // noValidate: the Action validates with Zod, so the browser must not block the submit first.
    <form action={formAction} noValidate>
      <label htmlFor={id}>Email</label>
      <input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        // React resets the form after the Action; on error, the reset lands on what was typed.
        defaultValue={error ? error.email : ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
      <SubmitButton />
      {state.status === 'success' && <p role="status">Subscribed {state.email}. Check your inbox.</p>}
    </form>
  );
}

/** Must be a child of the <form>: useFormStatus reads the nearest parent form, like a context. */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Subscribing…' : 'Subscribe'}
    </button>
  );
}
