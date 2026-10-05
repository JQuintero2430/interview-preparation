'use server';

import { initialSignupState, validateSignup, type SignupState } from './validate';

// Demo store. A real app would write to a database; module state is per server instance.
const registered = new Set<string>();

/**
 * A Server Function used as a form action. It is a PUBLIC POST endpoint: anyone can call it
 * with any FormData, whether or not your form exists. So it validates its input, and a real one
 * would also authenticate and authorize the caller before touching data.
 * The first parameter is the previous state, supplied by useActionState.
 */
export async function signup(_previous: SignupState, formData: FormData): Promise<SignupState> {
  const { values, errors } = validateSignup(formData);

  if (Object.keys(errors).length > 0) {
    return { ...initialSignupState, status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors, values };
  }
  if (registered.has(values.email)) {
    return {
      ...initialSignupState,
      status: 'error',
      message: 'That email is already registered.',
      fieldErrors: { email: 'Already registered.' },
      values,
    };
  }

  registered.add(values.email);
  return { ...initialSignupState, status: 'success', message: `Welcome, ${values.name}!` };
}
