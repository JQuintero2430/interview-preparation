import { useState } from 'react';

/**
 * Password input with its own show/hide state. It lives at module level, so its type is
 * created once and React can keep its state while the parent re-renders.
 */
function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label>
        Password
        <input type={visible ? 'text' : 'password'} />
      </label>
      <button type="button" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

/** Signup card: the parent's email state changes on every keystroke. */
export function SignupCard() {
  const [email, setEmail] = useState('');
  return (
    <form>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <PasswordField />
      <p>Signing up as {email || '…'}</p>
    </form>
  );
}
