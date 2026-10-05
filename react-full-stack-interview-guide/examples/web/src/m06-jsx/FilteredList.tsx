import { useState } from 'react';

export type Product = { id: string; name: string; inStock: boolean };

/**
 * Pure filter used during render: same inputs, same output, no mutation.
 * Matching is case-insensitive on the product name.
 */
export function filterProducts(
  products: readonly Product[],
  query: string,
  inStockOnly: boolean,
): Product[] {
  const needle = query.trim().toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(needle) && (!inStockOnly || p.inStock),
  );
}

/** A searchable product list. Everything visible is derived from props + two pieces of state. */
export function FilteredList({ products }: { products: readonly Product[] }) {
  const [query, setQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Derived during render: no extra state, no effect.
  const visible = filterProducts(products, query, inStockOnly);
  const hiddenCount = products.length - visible.length;

  return (
    <section>
      <label>
        Filter
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        In stock only
      </label>
      <p role="status">
        {visible.length} of {products.length} shown
      </p>
      {/* A boolean on the left of &&: `hiddenCount && …` would render a stray "0". */}
      {hiddenCount > 0 && <p>{hiddenCount} hidden by filters</p>}
      {visible.length > 0 ? <ProductRows products={visible} /> : <p>No matching products</p>}
    </section>
  );
}

function ProductRows({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name}
          {p.inStock ? null : ' (sold out)'}
        </li>
      ))}
    </ul>
  );
}
