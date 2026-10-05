import { useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';

type Props = { options: string[]; onSelect?: (option: string) => void };

/** WAI-ARIA combobox with a listbox popup (list autocomplete); DOM focus stays on the input. */
export function Autocomplete({ options, onSelect }: Props) {
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // index into `matches`, -1 = nothing highlighted

  const needle = query.trim().toLowerCase();
  const matches = options.filter((option) => option.toLowerCase().includes(needle)); // derived, never stored
  const expanded = open && matches.length > 0;

  function choose(option: string) {
    setQuery(option);
    setOpen(false);
    setActive(-1);
    onSelect?.(option);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setOpen(true);
    setActive(-1); // the list changed under the highlight: start again
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = matches.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        if (count === 0) break; // % 0 would give NaN
        setActive((a) => (a + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        if (count === 0) break;
        setActive((a) => (a <= 0 ? count - 1 : a - 1));
        break;
      case 'Enter': {
        const option = matches[active];
        if (expanded && option !== undefined) {
          event.preventDefault(); // do not submit a surrounding form
          choose(option);
        }
        break;
      }
      case 'Escape':
        if (open) setOpen(false); // first Escape closes the list
        else setQuery(''); // second one clears the text
        break;
    }
  }

  return (
    <div>
      <label htmlFor={`${baseId}-input`}>Language</label>
      <input
        id={`${baseId}-input`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={`${baseId}-list`}
        aria-activedescendant={expanded && active >= 0 ? `${baseId}-opt-${active}` : undefined}
        autoComplete="off"
        value={query}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      {expanded && (
        <ul role="listbox" id={`${baseId}-list`} aria-label="Suggestions">
          {matches.map((option, index) => (
            <li
              key={option}
              role="option"
              id={`${baseId}-opt-${index}`}
              aria-selected={index === active}
              onMouseDown={(e) => e.preventDefault()} // keep focus on the input, or blur would close the list first
              onClick={() => choose(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      <p role="status">{open ? (matches.length === 0 ? 'No matches' : `${matches.length} results available`) : ''}</p>
    </div>
  );
}
