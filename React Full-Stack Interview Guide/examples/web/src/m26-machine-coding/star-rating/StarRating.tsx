import { useState, type KeyboardEvent } from 'react';

type Props = {
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
};

const starLabel = (n: number) => `${n} star${n === 1 ? '' : 's'}`;

/** A radiogroup: arrow keys move and select, hover previews, one tab stop (roving tabindex). */
export function StarRating({ max = 5, defaultValue = 0, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value; // the preview wins while the pointer is over a star

  function select(next: number, group?: HTMLElement) {
    setValue(next);
    onChange?.(next);
    group?.querySelector<HTMLElement>(`[data-star="${next}"]`)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    select(Math.min(max, Math.max(1, (value || 0) + step)), event.currentTarget);
  }

  return (
    <div role="radiogroup" aria-label="Rating" onKeyDown={onKeyDown}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={starLabel(n)}
          data-star={n}
          data-filled={n <= shown}
          tabIndex={n === (value || 1) ? 0 : -1} // roving tabindex: first star is the tab stop until a rating exists
          onClick={() => select(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
        >
          <span aria-hidden="true">{n <= shown ? '★' : '☆'}</span>
        </button>
      ))}
    </div>
  );
}
