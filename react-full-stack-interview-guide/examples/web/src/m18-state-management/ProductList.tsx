import { itemAdded } from './cartSlice';
import { useAppDispatch } from './hooks';
import { formatCents } from './products';
import { useGetProductsQuery, useUpdatePriceMutation } from './productsApi';

const DISCOUNT_RATE = 0.9;

/** Server state from RTK Query, client state (the cart) from a slice: one store, two kinds of state. */
export function ProductList() {
  const { data, isLoading, isError, isFetching } = useGetProductsQuery();
  const [updatePrice, { isLoading: isSaving }] = useUpdatePriceMutation();
  const dispatch = useAppDispatch();

  if (isLoading) return <p role="status">Loading products…</p>;
  if (isError || !data) return <p role="alert">Could not load products.</p>;

  return (
    <ul aria-label="Products" aria-busy={isFetching}>
      {data.map((p) => (
        <li key={p.id}>
          <span>{`${p.name} — ${formatCents(p.price)}`}</span>
          <button type="button" onClick={() => dispatch(itemAdded(p))}>
            Add {p.name} to cart
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void updatePrice({ id: p.id, price: Math.round(p.price * DISCOUNT_RATE) })}
          >
            Discount {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
