import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './CenteredModal.module.css';

// React 19 ref callback with cleanup: focus the dialog on mount, restore focus on unmount.
// This is NOT a focus trap: see 26.6 for Tab wrapping, or use <dialog>.showModal() / `inert`.
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
  /** Render into document.body (default). `false` renders in place, which reproduces the stacking-context trap. */
  portal?: boolean;
};

export function CenteredModal({ title, onClose, children, portal = true }: Props) {
  const titleId = useId();
  const content = (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={focusWhileOpen}
        className={styles.dialog}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
  return portal ? createPortal(content, document.body) : content;
}
