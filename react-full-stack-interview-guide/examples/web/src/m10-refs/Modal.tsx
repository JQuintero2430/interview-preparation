import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

// React 19 ref callback with cleanup: focus the dialog when it mounts,
// give focus back to whatever had it when the dialog unmounts.
// Accepts any element, so the param must include null (see 10.3 TypeScript trap); React 19 never passes null here.
function focusWhileOpen(dialog: HTMLElement | null) {
  if (!dialog) return;
  const previouslyFocused = document.activeElement;
  dialog.focus();
  return () => {
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  };
}

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  container?: Element; // defaults to document.body: client-only, see 10.6
};

export function Modal({ title, onClose, children, container = document.body }: Props) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={focusWhileOpen}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <h2>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>,
    container,
  );
}
