import { useState, type KeyboardEvent } from 'react';

export type ToolbarItem = { id: string; label: string };

type Props = {
  label: string;
  items: readonly ToolbarItem[];
};

// Roving tabindex (WAI-ARIA APG "Toolbar" pattern): the toolbar is ONE tab stop.
// Exactly one button has tabIndex 0; the rest have -1 and are reached with the arrow keys.
export function FormatToolbar({ label, items }: Props) {
  const [active, setActive] = useState(0);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = items.length;
    if (n === 0) return;
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
        next = (active + 1) % n;
        break;
      case 'ArrowLeft':
        next = (active - 1 + n) % n;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    // Moving real focus triggers the button's onFocus below, which updates `active`.
    e.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }

  function toggle(id: string) {
    setPressed((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  return (
    <div role="toolbar" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          tabIndex={i === active ? 0 : -1}
          aria-pressed={pressed.has(item.id)}
          onFocus={() => setActive(i)}
          onClick={() => toggle(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
