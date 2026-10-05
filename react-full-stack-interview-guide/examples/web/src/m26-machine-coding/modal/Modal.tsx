import { useId, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusablesIn = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));

// Ref callback with cleanup (React 19): move focus in on mount, give it back on unmount.
// The parameter type includes null (React's RefCallback type): see 10.3.
function focusWhileOpen(dialog: HTMLElement | null) {
  if (!dialog) return;
  const opener = document.activeElement;
  (focusablesIn(dialog)[0] ?? dialog).focus();
  return () => {
    if (opener instanceof HTMLElement) opener.focus();
  };
}

type Props = { title: string; onClose: () => void; children: ReactNode };

/**
 * Modal built from a div, not <dialog>: jsdom has no showModal(), and the trap is what is being tested.
 * Render it conditionally: mounted = open.
 */
export function Modal({ title, onClose, children }: Props) {
  const titleId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = focusablesIn(event.currentTarget);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) {
      event.preventDefault(); // nothing to focus: keep focus on the dialog
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Close only when the press lands on the backdrop itself, not on something inside the dialog.
  function onBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div data-testid="backdrop" onClick={onBackdropClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={focusWhileOpen}
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
