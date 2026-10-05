// Validation is a pure function of the values. The form derives errors from it on every render
// instead of storing `errors` or `isValid` in state, so they can never disagree with the inputs.
export type SignupValues = { email: string; password: string; confirm: string };
export type SignupField = keyof SignupValues;
export type SignupErrors = Partial<Record<SignupField, string>>;

export const emptySignup: SignupValues = { email: '', password: '', confirm: '' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Rule = (values: SignupValues) => string | null;

// A validator map: adding a field adds an entry, not a branch.
const rules: Record<SignupField, Rule> = {
  email: (v) => (EMAIL_PATTERN.test(v.email) ? null : 'Enter a valid email'),
  password: (v) =>
    v.password.length >= MIN_PASSWORD_LENGTH ? null : `Use at least ${MIN_PASSWORD_LENGTH} characters`,
  confirm: (v) => (v.confirm === v.password ? null : 'Passwords do not match'),
};

/** Returns one message per invalid field; an empty object means the values are valid. */
export function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  for (const field of Object.keys(rules) as SignupField[]) {
    const message = rules[field](values);
    if (message) errors[field] = message;
  }
  return errors;
}

/** True when `errors` contains no messages. */
export const hasNoErrors = (errors: SignupErrors) => Object.keys(errors).length === 0;
