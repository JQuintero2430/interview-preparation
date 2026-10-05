import { useId, useState, type ReactNode } from 'react';

type Props = {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

// A disclosure widget (WAI-ARIA APG "Disclosure" pattern): a native <button> that
// toggles one region. The button gives us role, focusability and Enter/Space for free.
export function Disclosure({ summary, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {summary}
      </button>
      {/* `hidden` keeps the content in the DOM but removes it from layout and the accessibility tree */}
      <div id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
