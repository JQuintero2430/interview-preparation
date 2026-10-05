import { useId, useState, type SubmitEvent } from 'react';
import { subscribe } from './api';

/**
 * The same newsletter form written the React ≤ 18 way: onSubmit + preventDefault, a controlled
 * input, and pending/error/success state managed by hand. It still works in React 19.
 */
export function LegacyNewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<string | null>(null);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // otherwise the browser navigates (a full page POST/GET)
    if (isSubmitting) return; // guard against double submits; Actions queue them instead
    setIsSubmitting(true);
    setError(null);
    setSubscribed(null);
    try {
      await subscribe(email);
      setSubscribed(email);
      setEmail(''); // the manual "reset"
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false); // forget this and the button stays disabled forever after an error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={id}>Email</label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} role="alert" aria-live="polite">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing…' : 'Subscribe'}
      </button>
      {subscribed && <p role="status">Subscribed {subscribed}. Check your inbox.</p>}
    </form>
  );
}
