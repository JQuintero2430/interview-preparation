// Exercise 11.1: a model of the APG roving tabindex, not a browser and not a screen reader.
// Not modelled: real Tab presses, type-ahead, modifier keys, `aria-activedescendant`, `MutationObserver`.

export type Orientation = 'horizontal' | 'vertical' | 'both';

export interface RovingOptions {
  itemSelector: string;
  orientation: Orientation;
  wrap?: boolean;
  direction?: 'ltr' | 'rtl';
}

export interface Roving {
  /** Makes the nth enabled item the tab stop and focuses it. */
  activate(index: number): void;
  destroy(): void;
}

type Move = 1 | -1 | 'first' | 'last';

function moveFor(key: string, { orientation, direction = 'ltr' }: RovingOptions): Move | undefined {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (horizontal && key === forward) return 1;
  if (horizontal && key === backward) return -1;
  if (vertical && key === 'ArrowDown') return 1;
  if (vertical && key === 'ArrowUp') return -1;
  return undefined;
}

/** Index to move to among `count` enabled items; at an end it stays, or wraps when `wrap` is true. */
function targetIndex(count: number, current: number, move: Move, wrap: boolean): number {
  if (move === 'first') return 0;
  if (move === 'last') return count - 1;
  const next = current + move;
  if (next >= 0 && next < count) return next;
  return wrap ? (next + count) % count : current;
}

export function createRovingTabindex(container: HTMLElement, options: RovingOptions): Roving {
  const { itemSelector, wrap = false } = options;
  const allItems = (): HTMLElement[] => [...container.querySelectorAll<HTMLElement>(itemSelector)];
  const enabledItems = (): HTMLElement[] => allItems().filter((item) => !item.hasAttribute('disabled'));

  const setStop = (stop: HTMLElement | undefined): void => {
    for (const item of allItems()) item.setAttribute('tabindex', item === stop ? '0' : '-1');
  };
  const activateItem = (item: HTMLElement): void => {
    setStop(item);
    item.focus();
  };
  const currentIndex = (enabled: HTMLElement[], event: Event): number => {
    const from = event.target instanceof Element ? event.target.closest<HTMLElement>(itemSelector) : null;
    return Math.max(0, from ? enabled.indexOf(from) : enabled.findIndex((item) => item.tabIndex === 0));
  };

  const onKeydown = (event: KeyboardEvent): void => {
    const move = moveFor(event.key, options);
    const enabled = enabledItems();
    if (move === undefined || enabled.length === 0) return;
    event.preventDefault();
    const next = enabled[targetIndex(enabled.length, currentIndex(enabled, event), move, wrap)];
    if (next) activateItem(next);
  };
  const onFocusin = (event: FocusEvent): void => {
    const item = event.target instanceof Element ? event.target.closest<HTMLElement>(itemSelector) : null;
    if (item && enabledItems().includes(item)) setStop(item);
  };

  const controller = new AbortController();
  const { signal } = controller;
  container.addEventListener('keydown', onKeydown, { signal });
  container.addEventListener('focusin', onFocusin, { signal });
  setStop(enabledItems()[0]);

  return {
    activate(index: number): void {
      const item = enabledItems()[index];
      if (item) activateItem(item);
    },
    destroy(): void {
      controller.abort();
    },
  };
}
