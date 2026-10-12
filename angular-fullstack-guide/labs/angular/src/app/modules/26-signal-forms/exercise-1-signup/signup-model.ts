export interface Signup {
  email: string;
  password: string;
  age: number | null;
}

export const INITIAL_SIGNUP: Signup = { email: '', password: '', age: null };

export const SIGNUP_MESSAGES: Readonly<Record<string, string>> = {
  required: 'This field is required',
  email: 'Enter a valid email address',
  minLength: 'Use at least 8 characters',
  min: 'You must be 18 or older',
};
