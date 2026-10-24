// Exercise 40.1: the virtual-DOM contract both runtimes share. Our code, not React or Vue: element, text and
// component vnodes, h() and c() to build them, and memo() with a shallow Object.is compare modeled on
// react-dom 19.3.1's shallowEqual (cjs/react-dom-client.development.js, internal, read, not run).
// A vnode keeps the DOM node, state and child it was mounted or patched with, as Vue's vnode.el does.

export type Key = string | number;
export type Props = Readonly<Record<string, unknown>>;
/** A component instance's own state; it lives while the instance keeps its type and key. */
export type State = Map<string, unknown>;
export type ComponentFn<P extends Props> = (props: P, state: State) => VNode;

export interface TextVNode {
  readonly kind: 'text';
  readonly key?: Key;
  readonly value: string;
  node?: Text;
}

export interface ElementVNode {
  readonly kind: 'element';
  readonly key?: Key;
  readonly tag: string;
  readonly children: readonly VNode[];
  node?: HTMLElement;
}

export interface ComponentVNode {
  readonly kind: 'component';
  readonly key?: Key;
  /** The component function: its identity is the vnode's type. */
  readonly type: object;
  readonly props: Props;
  /** Calls the component function with these props. */
  readonly run: (state: State) => VNode;
  state?: State;
  child?: VNode;
}

export type VNode = TextVNode | ElementVNode | ComponentVNode;

export function text(value: string, key?: Key): TextVNode {
  return { kind: 'text', key, value };
}

/** An element vnode; a string child becomes a text vnode. */
export function h(tag: string, children: readonly (VNode | string)[] = [], key?: Key): ElementVNode {
  return { kind: 'element', tag, key, children: children.map((child) => (typeof child === 'string' ? text(child) : child)) };
}

/** A component vnode. */
export function c<P extends Props>(fn: ComponentFn<P>, props: P, key?: Key): ComponentVNode {
  return { kind: 'component', key, type: fn, props, run: (state) => fn(props, state) };
}

const memoized = new WeakSet<object>();

/** Wraps a component so a patch skips it while its props stay shallow-equal. */
export function memo<P extends Props>(fn: ComponentFn<P>): ComponentFn<P> {
  const wrapped: ComponentFn<P> = (props, state) => fn(props, state);
  memoized.add(wrapped);
  return wrapped;
}

export function isMemo(type: object): boolean {
  return memoized.has(type);
}

/** Same key count, then own key and Object.is per key, as shallowEqual does. */
export function shallowEqual(a: Props, b: Props): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && Object.is(a[key], b[key]));
}

function identity(v: VNode): unknown {
  switch (v.kind) {
    case 'text':
      return 'text';
    case 'element':
      return v.tag;
    case 'component':
      return v.type;
  }
}

/** Same kind, same tag or component function, same key: the old DOM node and state can be kept. */
export function isSameVNode(a: VNode, b: VNode): boolean {
  return a.kind === b.kind && a.key === b.key && identity(a) === identity(b);
}

export function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('vnode is not mounted');
  return value;
}

/** The DOM node a vnode owns; a component owns its child's. */
export function domOf(v: VNode): Node {
  return v.kind === 'component' ? domOf(must(v.child)) : must(v.node);
}
