/** A plain keyed list. The test watches which <li> nodes React physically moves. */
export function KeyedList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
