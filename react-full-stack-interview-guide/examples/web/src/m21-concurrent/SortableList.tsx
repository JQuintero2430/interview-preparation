import { addTransitionType, startTransition, useState, ViewTransition } from 'react';

/**
 * <ViewTransition> (stable in React 19.3) animates DOM changes caused by a Transition using the
 * browser's View Transition API. Where `document.startViewTransition` does not exist (jsdom,
 * older browsers) React simply skips the animation and the update still happens.
 */
export function SortableList({ items }: { items: string[] }) {
  const [descending, setDescending] = useState(false);
  const sorted = [...items].sort();
  if (descending) sorted.reverse();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            addTransitionType('reorder'); // lets CSS / the `update` prop pick an animation per cause
            setDescending((d) => !d);
          })
        }
      >
        Reverse
      </button>
      <ul>
        {sorted.map((item) => (
          <ViewTransition key={item}>
            <li>{item}</li>
          </ViewTransition>
        ))}
      </ul>
    </div>
  );
}
