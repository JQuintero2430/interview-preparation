// Shared jsdom helper for module 11. Needs `// @vitest-environment jsdom` in the test file.
// jsdom implements focus, ARIA reflection and constraint validation, and no accessibility tree, layout or sequential
// focus navigation: see section-2-jsdom-limits.test.ts.

const mounted: Element[] = [];

/** Inserts the markup inside a wrapper `div` of the document body and returns the wrapper. */
export function mount(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  mounted.push(root);
  return root;
}

/** Removes everything `mount` added and clears focus; call it from `afterEach`. */
export function unmount(): void {
  for (const node of mounted.splice(0)) node.remove();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

/** Dispatches a bubbling, cancelable `keydown` on the target and returns it, so `defaultPrevented` can be read. */
export function key(target: Element, name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

/** Finds an element that must exist, or throws with the selector (keeps tests free of non-null assertions). */
export function need<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`No element matches ${selector}`);
  return found;
}
