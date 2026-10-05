import type { CartLine } from './cartSlice';
import { selectCount, selectTotal, useCartStore } from './cartStore';
import { CATALOG, formatCents, itemCount } from './products';

/** The Zustand cart: same UI as `Cart`, no Provider needed. */
export function ZustandCart() {
  return (
    <section aria-label="Cart">
      <Catalog />
      <CartLines />
      <CartSummaryLine />
    </section>
  );
}

function Catalog() {
  // Selecting an action: functions defined in `create` never change, so this never re-renders.
  const add = useCartStore((s) => s.add);
  return (
    <ul aria-label="Catalog">
      {CATALOG.map((p) => (
        <li key={p.id}>
          {`${p.name} ${formatCents(p.price)} `}
          <button type="button" onClick={() => add(p)}>
            Add {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function CartLines() {
  const lines = useCartStore((s) => s.lines);
  if (lines.length === 0) return <p>Your cart is empty.</p>;
  return (
    <ul aria-label="Cart lines">
      {lines.map((line) => (
        <CartLineRow key={line.id} line={line} />
      ))}
    </ul>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  return (
    <li>
      <span>{`${line.name} × ${line.quantity}`}</span>
      <button type="button" aria-label={`Decrease ${line.name}`} onClick={() => setQuantity(line.id, line.quantity - 1)}>
        −
      </button>
      <button type="button" aria-label={`Increase ${line.name}`} onClick={() => setQuantity(line.id, line.quantity + 1)}>
        +
      </button>
      <button type="button" aria-label={`Remove ${line.name}`} onClick={() => remove(line.id)}>
        ×
      </button>
    </li>
  );
}

function CartSummaryLine() {
  // Two primitive selectors instead of one selector returning { count, total }:
  // in Zustand 5 a selector that returns a new object every call loops forever (see 18.8).
  const count = useCartStore(selectCount);
  const total = useCartStore(selectTotal);
  return <p role="status">{`${itemCount(count)} · ${formatCents(total)}`}</p>;
}
