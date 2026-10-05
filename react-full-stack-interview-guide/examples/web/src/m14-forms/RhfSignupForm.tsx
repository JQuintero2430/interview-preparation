import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerUser } from './api';
import { FormField } from './FormField';
import { signupSchema, type SignupInput, type SignupValues } from './signupSchema';

type Props = { onRegistered: (userId: string) => void };

export function RhfSignupForm({ onRegistered }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput, unknown, SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched', // first validation on blur, then on every change
    defaultValues: { email: '', password: '', confirm: '' },
  });

  // Runs only after the schema passed. Server rules (a taken email) come back as field errors.
  const onValid = async ({ email, password }: SignupValues) => {
    try {
      const result = await registerUser({ email, password });
      if (result.ok) onRegistered(result.userId);
      else setError(result.field, { type: 'server', message: result.message }, { shouldFocus: true });
    } catch {
      setError('root.server', { type: 'server', message: 'Could not reach the server. Try again.' });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email?.message}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="Use 8 or more characters."
        registration={register('password')}
        error={errors.password?.message}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        registration={register('confirm')}
        error={errors.confirm?.message}
      />
      {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
