// Exercise 08.1: one listener on a container handles events from every descendant that matches a selector.

/**
 * Listens for `type` on `root` and calls `handler` when the event started inside an element matching `selector`.
 * @param root The container that owns the listener; matches outside it are ignored.
 * @param type The event type, for example `'click'`. It must bubble to reach `root`.
 * @param selector A CSS selector for the elements to react to.
 * @param handler Called with the event and the matching element nearest to the event's target.
 * @returns A function that removes the listener.
 */
export function delegate(
  root: Element,
  type: string,
  selector: string,
  handler: (event: Event, matched: Element) => void,
): () => void {
  const controller = new AbortController();
  root.addEventListener(
    type,
    (event) => {
      if (!(event.target instanceof Element)) return;
      const matched = event.target.closest(selector);
      // closest() walks past root to the document, so a matching ancestor of root must not count.
      if (matched && root.contains(matched)) handler(event, matched);
    },
    { signal: controller.signal },
  );
  return () => controller.abort();
}
