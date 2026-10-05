import { selectCartLines, selectCartSummary } from './cartSelectors';
import { itemAdded, itemRemoved, quantityChanged, type CartLine } from './cartSlice';
import { useAppDispatch, useAppSelector } from './hooks';
import { CATALOG, formatCents, itemCount } from './products';

/** The Redux Toolkit cart. Needs a react-redux <Provider store> above it. */
export function Cart() {
  return (
    <section aria-label="Cart">
      <Catalog />
      <CartLines />
      <CartSummaryLine />
    </section>
  );
}

function Catalog() {
  // useDispatch subscribes to nothing: this component never re-renders because of the store.
  const dispatch = useAppDispatch();
  return (
    <ul aria-label="Catalog">
      {CATALOG.map((p) => (
        <li key={p.id}>
          {`${p.name} ${formatCents(p.price)} `}
          <button type="button" onClick={() => dispatch(itemAdded(p))}>
            Add {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function CartLines() {
  const lines = useAppSelector(selectCartLines);
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
  const dispatch = useAppDispatch();
  const setQuantity = (quantity: number) => dispatch(quantityChanged({ id: line.id, quantity }));
  return (
    <li>
      <span>{`${line.name} × ${line.quantity}`}</span>
      <button type="button" aria-label={`Decrease ${line.name}`} onClick={() => setQuantity(line.quantity - 1)}>
        −
      </button>
      <button type="button" aria-label={`Increase ${line.name}`} onClick={() => setQuantity(line.quantity + 1)}>
        +
      </button>
      <button type="button" aria-label={`Remove ${line.name}`} onClick={() => dispatch(itemRemoved(line.id))}>
        ×
      </button>
    </li>
  );
}

function CartSummaryLine() {
  // A memoized selector: same object back until the lines change, so no extra re-renders.
  const { count, total } = useAppSelector(selectCartSummary);
  return <p role="status">{`${itemCount(count)} · ${formatCents(total)}`}</p>;
}
