import { useId, useState, type KeyboardEvent } from 'react';
import { useTypeaheadResults, type SearchFn } from './useTypeaheadResults';

type Props = {
  label: string;
  search: SearchFn;
  onSelect: (value: string) => void;
  delayMs?: number;
};

// WAI-ARIA APG "editable combobox with list autocomplete": DOM focus stays on the input,
// aria-activedescendant points at the highlighted option.
export function Typeahead({ label, search, onSelect, delayMs }: Props) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { status, items, error } = useTypeaheadResults(text, search, delayMs);

  const expanded = open && status === 'ready' && items.length > 0;
  const activeIndex = expanded && active < items.length ? active : -1;

  function choose(value: string) {
    setText(value);
    setOpen(false);
    setActive(-1);
    onSelect(value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!expanded) setOpen(true);
        else setActive((activeIndex + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (expanded) setActive(activeIndex <= 0 ? items.length - 1 : activeIndex - 1);
        break;
      case 'Enter': {
        const value = items[activeIndex];
        if (value !== undefined) {
          e.preventDefault();
          choose(value);
        }
        break;
      }
      case 'Escape':
        if (expanded) setOpen(false);
        else setText('');
        break;
    }
  }

  const message =
    status === 'loading' ? 'Searching…' : status === 'error' ? error : status === 'ready' ? (items.length === 0 ? 'No results' : `${items.length} results`) : '';

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      <ul id={listId} role="listbox" aria-label={label} hidden={!expanded}>
        {items.map((item, i) => (
          <li
            key={item}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex}
            onMouseDown={(e) => e.preventDefault()} // keep focus on the input
            onClick={() => choose(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <p role="status">{message}</p>
    </div>
  );
}
