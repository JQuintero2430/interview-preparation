// Exercise 40.1: the part both runtimes share (our code): mount, patch, unmount and unkeyed children.
// Only keyed children differ, so each variant passes its own KeyedStrategy (a: react-dom's lastPlacedIndex rule,
// b: @vue/runtime-core's longest increasing subsequence). Not covered: attributes, events, effects, scheduling.
import { domOf, isMemo, isSameVNode, must, shallowEqual } from './vdom';
import type { ComponentVNode, ElementVNode, TextVNode, VNode } from './vdom';

/** What a keyed strategy may ask the renderer to do. */
export interface Host {
  /** Creates the DOM for `v` and inserts it into `parent` before `before` (null: at the end). */
  mount(v: VNode, parent: Node, before: Node | null): void;
  /** Brings `old`'s DOM up to date with `next`, or replaces it when the two are not the same vnode. */
  patch(old: VNode, next: VNode, parent: Node): void;
  unmount(v: VNode, parent: Node): void;
}

/** Reconciles children that all carry a key: patch the matches, mount, unmount and move DOM nodes. */
export type KeyedStrategy = (parent: Node, old: readonly VNode[], next: readonly VNode[], host: Host) => void;

/** Renders `vnode` into `container`: mounts on the first call, patches the previous tree afterwards. */
export type RenderFn = (vnode: VNode, container: Element) => void;

export function createRenderer(reconcileKeyed: KeyedStrategy): RenderFn {
  const roots = new WeakMap<Element, VNode>();
  const host: Host = { mount, patch, unmount };

  function mount(v: VNode, parent: Node, before: Node | null): void {
    switch (v.kind) {
      case 'text':
        v.node = document.createTextNode(v.value);
        parent.insertBefore(v.node, before);
        return;
      case 'element': {
        const element = document.createElement(v.tag);
        v.children.forEach((child) => mount(child, element, null));
        v.node = element;
        parent.insertBefore(element, before);
        return;
      }
      case 'component':
        v.state = new Map();
        v.child = v.run(v.state);
        mount(v.child, parent, before);
    }
  }

  function patch(old: VNode, next: VNode, parent: Node): void {
    if (!isSameVNode(old, next)) {
      // A new type or key replaces the subtree: new DOM, new component state.
      mount(next, parent, domOf(old));
      unmount(old, parent);
    } else if (old.kind === 'text' && next.kind === 'text') {
      patchText(old, next);
    } else if (old.kind === 'element' && next.kind === 'element') {
      patchElement(old, next);
    } else if (old.kind === 'component' && next.kind === 'component') {
      patchComponent(old, next, parent);
    }
  }

  function patchText(old: TextVNode, next: TextVNode): void {
    const node = must(old.node);
    next.node = node;
    if (old.value !== next.value) node.data = next.value; // the only DOM write an update makes
  }

  function patchElement(old: ElementVNode, next: ElementVNode): void {
    next.node = must(old.node);
    patchChildren(next.node, old.children, next.children);
  }

  function patchComponent(old: ComponentVNode, next: ComponentVNode, parent: Node): void {
    next.state = old.state;
    if (isMemo(next.type) && shallowEqual(old.props, next.props)) {
      next.child = old.child; // the bailout: the function is not called and its old subtree stays
      return;
    }
    next.child = next.run(must(next.state));
    patch(must(old.child), next.child, parent);
  }

  function patchChildren(parent: Node, old: readonly VNode[], next: readonly VNode[]): void {
    if (next.length > 0 && [...old, ...next].every((v) => v.key !== undefined)) {
      reconcileKeyed(parent, old, next, host);
      return;
    }
    next.forEach((v, i) => {
      const previous = old[i];
      if (previous === undefined) mount(v, parent, null);
      else patch(previous, v, parent);
    });
    old.slice(next.length).forEach((v) => unmount(v, parent));
  }

  function unmount(v: VNode, parent: Node): void {
    parent.removeChild(domOf(v));
  }

  return (vnode, container) => {
    const previous = roots.get(container);
    if (previous === undefined) mount(vnode, container, null);
    else patch(previous, vnode, container);
    roots.set(container, vnode);
  };
}
