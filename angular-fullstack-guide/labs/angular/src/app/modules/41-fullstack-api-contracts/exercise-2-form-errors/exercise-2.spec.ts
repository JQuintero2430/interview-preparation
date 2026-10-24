import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { parsePointer } from '../concepts/json-pointer';
import { applyToReactive, customerForm } from './a/apply-to-reactive';
import { fieldAt, submitWithServerErrors } from './b/apply-to-signal-forms';
import { type ApplyResult, type Customer, type FieldError, SERVER_ERROR } from './server-errors';

type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];

/** Our example customer: two rows, so that the row index matters. */
const CUSTOMER: Customer = {
  email: 'ann@example.com',
  address: { street: 'Main St 1', city: 'Lyon' },
  items: [
    { sku: 'A-1', quantity: 1 },
    { sku: 'B-2', quantity: 4 },
  ],
};

/** What a test does to a form, the same for both variants; fields are named by JSON Pointer. */
interface Harness {
  apply(errors: readonly FieldError[]): Promise<ApplyResult>;
  serverError(pointer: string): string | null;
  edit(pointer: string, value: string): void;
}

/** Variant a: the errors are applied to the reactive form after the request failed. */
function reactiveHarness(): Harness {
  const customer = customerForm(CUSTOMER);
  const control = (pointer: string) => customer.get([...parsePointer(pointer)]);
  return {
    apply: async (errors) => applyToReactive(customer, errors),
    serverError: (pointer) => control(pointer)?.getError(SERVER_ERROR) ?? null,
    edit: (pointer, value) => control(pointer)?.setValue(value),
  };
}

/** Variant b: a fake send (no network) answers the `submit()` action with the errors. */
function signalHarness(): Harness {
  const tree = TestBed.runInInjectionContext(() => form(signal<Customer>(structuredClone(CUSTOMER))));
  const field = (pointer: string) => fieldAt(tree, parsePointer(pointer));
  return {
    apply: (errors) => submitWithServerErrors(tree, async () => errors),
    serverError: (pointer) =>
      field(pointer)?.().errors().find((error) => error.kind === SERVER_ERROR)?.message ?? null,
    edit: (pointer, value) => field(pointer)?.().value.set(value),
  };
}

const HARNESSES: Record<Variant, () => Harness> = { a: reactiveHarness, b: signalHarness };

describe.each(VARIANTS)('Exercise 41.2 variant %s', (variant) => {
  it("puts a pointer's message on the matching top-level field", async () => {
    const harness = HARNESSES[variant]();
    const result = await harness.apply([{ pointer: '#/email', detail: 'Email already used' }]);
    expect(result.applied).toEqual(['email']);
    expect(harness.serverError('#/email')).toBe('Email already used');
  });

  it('puts a pointer into a nested group on the nested field', async () => {
    const harness = HARNESSES[variant]();
    const result = await harness.apply([{ pointer: '#/address/street', detail: 'Street not found' }]);
    expect(result.applied).toEqual(['address.street']);
    expect(harness.serverError('#/address/street')).toBe('Street not found');
    expect(harness.serverError('#/address/city')).toBeNull();
  });

  it("puts a pointer into an array on the right row's field", async () => {
    const harness = HARNESSES[variant]();
    const result = await harness.apply([{ pointer: '#/items/1/quantity', detail: 'Only 3 left' }]);
    expect(result.applied).toEqual(['items.1.quantity']);
    expect(harness.serverError('#/items/1/quantity')).toBe('Only 3 left');
    expect(harness.serverError('#/items/0/quantity')).toBeNull();
  });

  it('collects pointers that match no field as form-level errors', async () => {
    const harness = HARNESSES[variant]();
    const result = await harness.apply([
      { pointer: '#/nickname', detail: 'Unknown field' },
      { pointer: '#/items/5/quantity', detail: 'No such row' },
      { pointer: '#', detail: 'Account locked' },
    ]);
    expect(result).toEqual({
      applied: [],
      formLevel: ['Unknown field', 'No such row', 'Account locked'],
      firstInvalid: null,
    });
  });

  it("clears a field's server error when the user edits that field", async () => {
    const harness = HARNESSES[variant]();
    await harness.apply([
      { pointer: '#/email', detail: 'Email already used' },
      { pointer: '#/address/street', detail: 'Street not found' },
    ]);
    harness.edit('#/email', 'bob@example.com');
    expect(harness.serverError('#/email')).toBeNull();
    expect(harness.serverError('#/address/street')).toBe('Street not found');
  });

  it('reports the first field with a server error in form order, for focus', async () => {
    const harness = HARNESSES[variant]();
    const result = await harness.apply([
      { pointer: '#/items/1/quantity', detail: 'Only 3 left' },
      { pointer: '#/address/street', detail: 'Street not found' },
    ]);
    expect(result.applied).toEqual(['items.1.quantity', 'address.street']);
    expect(result.firstInvalid).toBe('address.street');
  });
});
