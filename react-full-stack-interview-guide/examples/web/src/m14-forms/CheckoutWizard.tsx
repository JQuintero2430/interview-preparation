import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type SubmitEvent } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FormField } from './FormField';

export const checkoutSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
  fullName: z.string().trim().min(1, { error: 'Enter your full name' }),
  address: z.string().trim().min(5, { error: 'Enter a street address' }),
});
type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;

// One form, one schema; each step only names the fields it shows and validates.
const STEPS = [
  { title: 'Contact', fields: ['email'] },
  { title: 'Shipping', fields: ['fullName', 'address'] },
] as const satisfies ReadonlyArray<{ title: string; fields: ReadonlyArray<keyof CheckoutInput> }>;
type StepIndex = 0 | 1;
const LAST_STEP: StepIndex = 1;

type Props = { onComplete: (values: CheckoutValues) => void };

export function CheckoutWizard({ onComplete }: Props) {
  const [step, setStep] = useState<StepIndex>(0);
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: '', fullName: '', address: '' },
    // false is the default: values of fields that unmount (the previous step) are kept.
    shouldUnregister: false,
  });
  const current = STEPS[step];

  async function goNext() {
    // Validate only this step's fields; later steps are not the user's problem yet.
    if (await trigger(current.fields, { shouldFocus: true })) setStep(LAST_STEP);
  }

  // Enter on an intermediate step must mean "Next", not "submit everything".
  const onSubmit =
    step === LAST_STEP
      ? handleSubmit(onComplete)
      : (e: SubmitEvent<HTMLFormElement>) => {
          e.preventDefault();
          void goNext();
        };

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="checkout-step-title">
      <h2 id="checkout-step-title">
        Step {step + 1} of {STEPS.length}: {current.title}
      </h2>
      {step === 0 && (
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
      )}
      {step === 1 && (
        <>
          <FormField
            label="Full name"
            autoComplete="name"
            registration={register('fullName')}
            error={errors.fullName?.message}
          />
          <FormField
            label="Address"
            autoComplete="street-address"
            registration={register('address')}
            error={errors.address?.message}
          />
          <button type="button" onClick={() => setStep(0)}>
            Back
          </button>
        </>
      )}
      <button type="submit">{step === LAST_STEP ? 'Place order' : 'Next'}</button>
    </form>
  );
}
