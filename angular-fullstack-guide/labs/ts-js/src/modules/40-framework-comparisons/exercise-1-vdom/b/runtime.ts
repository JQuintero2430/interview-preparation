// Exercise 40.1, variant b: keyed children moved only when they fall outside a longest increasing subsequence.
// Our code modeled on @vue/runtime-core 3.5.44's patchKeyedChildren and getSequence (dist/runtime-core.cjs.js;
// internal names; read, not run). Not Vue: no compiler patch flags, fragments, transitions or Suspense.
import { createRenderer } from '../renderer';
import type { Host, KeyedStrategy } from '../renderer';
import { domOf, isSameVNode, must } from '../vdom';
import type { Key, VNode } from '../vdom';

/** Patches the pair when both exist and are the same vnode; says whether it did. */
function patchIfSame(old: VNode | undefined, next: VNode | undefined, parent: Node, host: Host): boolean {
  if (old === undefined || next === undefined || !isSameVNode(old, next)) return false;
  host.patch(old, next, parent);
  return true;
}

/** How many of the highest `tails` entries end a run that `value` can extend (a binary search). */
function runLength(values: readonly number[], tails: readonly number[], value: number): number {
  let low = 0;
  let high = tails.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((values[tails[middle] ?? 0] ?? 0) < value) low = middle + 1;
    else high = middle;
  }
  return low;
}

/** Indices of a longest increasing subsequence of the non-zero values (0 marks a new child), as getSequence. */
export function getSequence(values: readonly number[]): number[] {
  const tails: number[] = [];
  const previous = values.map(() => -1);
  values.forEach((value, i) => {
    if (value === 0) return;
    const length = runLength(values, tails, value);
    previous[i] = tails[length - 1] ?? -1;
    tails[length] = i;
  });
  const sequence: number[] = [];
  for (let i = tails[tails.length - 1] ?? -1; i >= 0; i = previous[i] ?? -1) sequence.unshift(i);
  return sequence;
}

const reconcileKeyed: KeyedStrategy = (parent, old, next, host) => {
  // 1. Patch the common prefix and suffix in place.
  let start = 0;
  let oldEnd = old.length - 1;
  let newEnd = next.length - 1;
  while (start <= Math.min(oldEnd, newEnd) && patchIfSame(old[start], next[start], parent, host)) start++;
  while (start <= Math.min(oldEnd, newEnd) && patchIfSame(old[oldEnd], next[newEnd], parent, host)) {
    oldEnd--;
    newEnd--;
  }

  // 2. Map each remaining new child to its old position + 1 (0: new); note whether any match went backwards.
  const keyToNewIndex = new Map<Key | undefined, number>();
  for (let i = start; i <= newEnd; i++) keyToNewIndex.set(next[i]?.key, i);
  const newIndexToOldIndex = Array.from({ length: newEnd - start + 1 }, () => 0);
  let moved = false;
  let maxNewIndexSoFar = 0;
  for (let i = start; i <= oldEnd; i++) {
    const previous = must(old[i]);
    const newIndex = keyToNewIndex.get(previous.key);
    const match = next[newIndex ?? -1];
    if (newIndex === undefined || match === undefined) {
      host.unmount(previous, parent);
      continue;
    }
    newIndexToOldIndex[newIndex - start] = i + 1;
    if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
    else moved = true;
    host.patch(previous, match, parent);
  }

  // 3. Walk backwards: mount new children, keep the sequence, move the rest before the following sibling.
  const sequence = moved ? getSequence(newIndexToOldIndex) : [];
  let j = sequence.length - 1;
  for (let i = newIndexToOldIndex.length - 1; i >= 0; i--) {
    const child = must(next[start + i]);
    const after = next[start + i + 1];
    const anchor = after === undefined ? null : domOf(after);
    if (newIndexToOldIndex[i] === 0) host.mount(child, parent, anchor);
    else if (sequence[j] === i) j--;
    else if (moved) parent.insertBefore(domOf(child), anchor);
  }
};

export const render = createRenderer(reconcileKeyed);
