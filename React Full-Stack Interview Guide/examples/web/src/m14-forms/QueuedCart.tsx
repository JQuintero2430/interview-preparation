import { useActionState, useLayoutEffect, useRef } from 'react';
import { addToCart } from './api';

// Records what the Action did and what the screen showed, in order.
export const log: string[] = [];

/** The Action: receives the previous state and the submitted FormData, returns the next state. */
async function addItems(previous: number, formData: FormData): Promise<number> {
  const quantity = Number(formData.get('quantity'));
  log.push(`action start: previous=${previous} quantity=${quantity}`);
  await addToCart(quantity);
  log.push(`action end: returns ${previous + quantity}`);
  return previous + quantity;
}

export function QueuedCart() {
  const [count, formAction, isPending] = useActionState(addItems, 0);
  const quantityRef = useRef<HTMLInputElement>(null);

  // After every commit, log what the user sees, but only when it differs from the last snapshot.
  // A layout effect runs after the DOM (including any automatic form reset) is updated.
  useLayoutEffect(() => {
    const snapshot = `screen: count=${count} pending=${isPending} input=${quantityRef.current?.value}`;
    if (log.findLast((entry) => entry.startsWith('screen:')) !== snapshot) log.push(snapshot);
  });

  return (
    <form action={formAction}>
      <label htmlFor="quantity">Quantity</label>
      <input ref={quantityRef} id="quantity" name="quantity" inputMode="numeric" defaultValue="1" />
      <button type="submit">Add to cart</button>
      <p>In cart: {count}</p>
    </form>
  );
}
