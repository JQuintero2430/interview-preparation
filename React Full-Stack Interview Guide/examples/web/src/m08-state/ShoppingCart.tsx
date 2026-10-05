import { useReducer } from 'react';
import { cartItemCount, cartReducer, cartTotalCents, emptyCart, type Product } from './cartReducer';

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** A product list plus a cart. All cart logic lives in the pure `cartReducer`. */
export function ShoppingCart({ products }: { products: readonly Product[] }) {
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);
  // Derived during render: there is no `total` state that could disagree with the lines.
  const total = cartTotalCents(cart);
  const count = cartItemCount(cart);

  return (
    <section>
      <ul aria-label="Products">
        {products.map((product) => (
          <li key={product.id}>
            <button onClick={() => dispatch({ type: 'added', product })}>Add {product.name}</button>
          </li>
        ))}
      </ul>

      {cart.lines.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul aria-label="Cart">
          {cart.lines.map(({ product, quantity }) => (
            <li key={product.id}>
              <span>
                {product.name} × {quantity}
              </span>
              <button
                aria-label={`Remove one ${product.name}`}
                onClick={() => dispatch({ type: 'decremented', productId: product.id })}
              >
                −
              </button>
            </li>
          ))}
        </ul>
      )}

      <p>
        Total: {formatPrice(total)} ({count} items)
      </p>
      <button onClick={() => dispatch({ type: 'cleared' })} disabled={count === 0}>
        Clear cart
      </button>
    </section>
  );
}
