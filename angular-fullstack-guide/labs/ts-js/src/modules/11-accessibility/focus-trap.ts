// A model of the hand-rolled modal focus trap: wrap Tab at the ends, optionally call back on Escape, restore focus on release.
// It decides from the DOM (selector and attributes) only. It does not check rendering, so a hidden element still counts
// as tabbable here (see section-2-jsdom-limits.test.ts); prefer a native modal <dialog> where it fits.

const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[contenteditable]',
  '[tabindex]',
].join(',');

export interface FocusTrap {
  release(): void;
}

export interface FocusTrapOptions {
  onEscape?: () => void;
}

/** Elements in document order that a Tab press could reach, judged from attributes only. */
export function tabbables(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0,
  );
}

function wrapTarget(container: HTMLElement, event: KeyboardEvent): HTMLElement | undefined {
  const items = tabbables(container);
  const [first, last] = [items[0], items[items.length - 1]];
  const active = document.activeElement;
  if (!first || !last) return undefined;
  if (event.shiftKey) return active === first || !container.contains(active) ? last : undefined;
  return active === last || !container.contains(active) ? first : undefined;
}

export function trapFocus(container: HTMLElement, options: FocusTrapOptions = {}): FocusTrap {
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      options.onEscape?.();
      return;
    }
    if (event.key !== 'Tab') return;
    const target = wrapTarget(container, event);
    if (!target) return;
    event.preventDefault();
    target.focus();
  };

  container.addEventListener('keydown', onKeydown);
  tabbables(container)[0]?.focus();

  return {
    release(): void {
      container.removeEventListener('keydown', onKeydown);
      opener?.focus();
    },
  };
}
