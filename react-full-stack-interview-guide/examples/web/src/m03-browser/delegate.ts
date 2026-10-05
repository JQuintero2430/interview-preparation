/**
 * Native event delegation: ONE listener on `root` serves every current and future descendant that
 * matches `selector`. Returns an unsubscribe function.
 *
 * Notes:
 * - Works only for events that bubble. `focus`/`blur` do not; use `focusin`/`focusout`.
 * - `closest` walks up from the real target, so clicks on a <span> inside the <li> still match the <li>.
 * - A descendant listener that calls `stopPropagation()` hides the event from this listener.
 */
export function delegate<K extends keyof HTMLElementEventMap>(
  root: HTMLElement,
  type: K,
  selector: string,
  handler: (event: HTMLElementEventMap[K], match: HTMLElement) => void,
): () => void {
  const listener = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const match = target.closest<HTMLElement>(selector);
    // `contains` guards against a match that lives OUTSIDE root (closest walks past root).
    if (match && match !== root && root.contains(match)) {
      handler(event as HTMLElementEventMap[K], match);
    }
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}
