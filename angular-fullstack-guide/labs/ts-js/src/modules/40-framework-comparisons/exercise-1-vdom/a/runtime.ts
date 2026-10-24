// Exercise 40.1, variant a: keyed children placed with the lastPlacedIndex rule. Our code modeled on react-dom
// 19.3.1's reconcileChildrenArray, placeChild and getHostSibling (cjs/react-dom-client.development.js; internal
// names; read, not run). Not React: no fibers, lanes or first in-order pass, and the commit runs at once.
import { createRenderer } from '../renderer';
import type { KeyedStrategy } from '../renderer';
import { domOf, isSameVNode } from '../vdom';
import type { Key, VNode } from '../vdom';

/** The DOM node of the first later sibling that stays in place (null: append), as getHostSibling finds it. */
function nextStableSibling(next: readonly VNode[], marked: readonly boolean[], from: number): Node | null {
  const sibling = next.find((_, i) => i > from && !marked[i]);
  return sibling === undefined ? null : domOf(sibling);
}

const reconcileKeyed: KeyedStrategy = (parent, old, next, host) => {
  const oldIndexByKey = new Map<Key | undefined, number>();
  old.forEach((v, i) => oldIndexByKey.set(v.key, i));
  const reused = new Set<number>();
  const staging = document.createDocumentFragment();
  let lastPlacedIndex = 0;

  // Render phase: match by key and mark what the commit must insert.
  const marked = next.map((v) => {
    const oldIndex = oldIndexByKey.get(v.key) ?? -1;
    const previous = old[oldIndex];
    if (previous === undefined || !isSameVNode(previous, v)) {
      host.mount(v, staging, null); // a new child: built now, inserted at commit
      return true;
    }
    reused.add(oldIndex);
    host.patch(previous, v, parent);
    if (oldIndex < lastPlacedIndex) return true; // placeChild: it sat before a child already kept in place
    lastPlacedIndex = oldIndex;
    return false;
  });

  // Commit phase: deletions first, then each marked child before its next stable sibling.
  old.forEach((v, i) => {
    if (!reused.has(i)) host.unmount(v, parent);
  });
  next.forEach((v, i) => {
    if (marked[i]) parent.insertBefore(domOf(v), nextStableSibling(next, marked, i));
  });
};

export const render = createRenderer(reconcileKeyed);
