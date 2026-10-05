import { useState } from 'react';

type Item = { id: number; text: string };

const INITIAL_ITEMS: Item[] = [
  { id: 1, text: 'Alpha' },
  { id: 2, text: 'Beta' },
];

type Props = {
  /** 'index' reproduces the bug; 'id' is the fix. Real code only ever uses a stable id. */
  keyBy: 'index' | 'id';
};

/** Each row owns DOM state (an uncontrolled input), so row identity matters. */
export function PrependList({ keyBy }: Props) {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const addToTop = () =>
    setItems((prev) => {
      const id = prev.length + 1; // rows are never removed in this demo, so length + 1 is unique
      return [{ id, text: `New ${id}` }, ...prev];
    });

  return (
    <>
      <button onClick={addToTop}>Add to top</button>
      <ul>
        {items.map((item, index) => (
          <li key={keyBy === 'index' ? index : item.id}>
            <input aria-label={`Note for ${item.text}`} />
          </li>
        ))}
      </ul>
    </>
  );
}
