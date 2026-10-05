// Plain module (no 'use server'): a "use server" file may export ONLY async functions, so the
// types, the initial state and the pure validator live here and are shared by the action and the form.

export type SignupFields = { name: string; email: string };

export type SignupState = {
  status: 'idle' | 'error' | 'success';
  message: string;
  fieldErrors: Partial<Record<keyof SignupFields, string>>;
  values: SignupFields;
};

export const initialSignupState: SignupState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
  values: { name: '', email: '' },
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates untrusted input. FormData values are `FormDataEntryValue | null` (string | File | null),
 * and a hand-made POST can send anything, so every field is narrowed before it is used.
 */
export function validateSignup(formData: FormData): { values: SignupFields; errors: SignupState['fieldErrors'] } {
  const rawName = formData.get('name');
  const rawEmail = formData.get('email');
  const values: SignupFields = {
    name: typeof rawName === 'string' ? rawName.trim() : '',
    email: typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '',
  };
  const errors: SignupState['fieldErrors'] = {};
  if (values.name.length < 2 || values.name.length > 50) errors.name = 'Name must be 2 to 50 characters.';
  if (values.email.length > 254 || !EMAIL.test(values.email)) errors.email = 'Enter a valid email address.';
  return { values, errors };
}
