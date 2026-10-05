type Props = {
  guests: readonly string[];
  /** Time is an input, not something render reads from the clock. */
  servedAt: Date;
};

/** Pure version of the "find the impure component" exercise: output depends only on props. */
export function TeaSet({ guests, servedAt }: Props) {
  // toSorted returns a new array; guests.sort() would mutate the parent's prop.
  const seated = guests.toSorted((a, b) => a.localeCompare(b));

  return (
    <>
      <p>Served at {servedAt.toISOString()}</p>
      <ol>
        {seated.map((name, index) => (
          <Cup key={name} name={name} seat={index + 1} />
        ))}
      </ol>
    </>
  );
}

// The seat number arrives as a prop instead of being counted in a module-level variable.
function Cup({ name, seat }: { name: string; seat: number }) {
  return (
    <li>
      Cup #{seat} for {name}
    </li>
  );
}
