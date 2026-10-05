import { useId, useState, type KeyboardEvent } from 'react';

export type AccordionItem = { id: string; title: string; content: string };

type Props = {
  items: AccordionItem[];
  /** Allow several panels open at once. Default: opening one closes the others. */
  multiple?: boolean;
};

/** WAI-ARIA accordion: heading > button[aria-expanded][aria-controls] + region[aria-labelledby]. */
export function Accordion({ items, multiple = false }: Props) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []); // single mode starts from empty
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Up/Down/Home/End move between the headers (the current APG accordion pattern no longer lists them as optional).
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-trigger]'));
    const current = triggers.findIndex((el) => el === document.activeElement);
    const target: Record<string, number> = {
      ArrowDown: (current + 1) % triggers.length,
      ArrowUp: (current - 1 + triggers.length) % triggers.length,
      Home: 0,
      End: triggers.length - 1,
    };
    const next = target[event.key];
    if (next === undefined || current === -1) return;
    event.preventDefault();
    triggers[next]?.focus();
  }

  return (
    <div onKeyDown={onKeyDown}>
      {items.map(({ id, title, content }) => {
        const isOpen = open.has(id);
        return (
          <div key={id}>
            <h3>
              <button
                type="button"
                id={`${baseId}-trigger-${id}`}
                data-trigger=""
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${id}`}
                onClick={() => toggle(id)}
              >
                {title}
              </button>
            </h3>
            <div
              role="region"
              id={`${baseId}-panel-${id}`}
              aria-labelledby={`${baseId}-trigger-${id}`}
              hidden={!isOpen}
            >
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
