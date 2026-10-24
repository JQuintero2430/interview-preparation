// Our model of react-dom 19.3.1's bailout rules, not React (read in cjs/react-dom-client.development.js, not run;
// every name below is internal to react-dom): beginWork compares the props object by identity;
// updateMemoComponent and updateSimpleMemoComponent compare props with shallowEqual (Object.is per key);
// dispatchSetStateInternal drops an Object.is-equal update before scheduling; checkIfContextChanged and
// propagateContextChanges re-render a context reader below a skipped parent. No keys, lanes, effects or DOM.

export interface Props { readonly [key: string]: unknown; readonly children?: readonly Element[] }
export interface Element { readonly type: Component; readonly props: Props }
export type Render = (props: Props) => readonly Element[];
export interface Memo { readonly memo: Render }
/** As in React 19, the context object is also its provider: `el(context, { value }, ...children)`. */
export interface Context<T> { current: T }
export type Component = Render | Memo | Context<unknown>;

interface Instance {
  readonly type: Component; props: Props; readonly cells: { value: unknown }[]; scheduled: boolean;
  reads?: Context<unknown>; seen?: unknown; children: Instance[];
}

let current: Instance | undefined;
let cell = 0;

export const memo = (render: Render): Memo => ({ memo: render });
export const createContext = <T>(value: T): Context<T> => ({ current: value });
export const el = (type: Component, props: Props = {}, ...children: Element[]): Element =>
  ({ type, props: children.length > 0 ? { ...props, children } : { ...props } });

function owner(): Instance {
  if (current === undefined) throw new Error('Hooks run only while a component renders');
  return current;
}

export function useState<T>(initial: T): [T, (next: T) => boolean];
export function useState(initial: unknown): [unknown, (next: unknown) => boolean] {
  const inst = owner();
  const slot = (inst.cells[cell++] ??= { value: initial });
  const set = (next: unknown): boolean => {
    if (!inst.scheduled && Object.is(next, slot.value)) return false; // eager bailout: nothing scheduled
    slot.value = next;
    inst.scheduled = true;
    return true;
  };
  return [slot.value, set];
}

export function useContext<T>(context: Context<T>): T {
  const inst = owner();
  inst.reads = context;
  inst.seen = context.current;
  return context.current;
}

function shallowEqual(a: Props, b: Props): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => Object.hasOwn(b, k) && Object.is(a[k], b[k]));
}

function update(inst: Instance | undefined, element: Element, log: string[]): Instance {
  const { type, props } = element;
  const fresh: Instance = { type, props, cells: [], scheduled: false, children: [] };
  if (inst === undefined || inst.type !== type) return run(fresh, log); // a new type replaces the subtree
  const contextChanged = inst.reads !== undefined && !Object.is(inst.reads.current, inst.seen);
  const equal = inst.props === props || (typeof type === 'object' && 'memo' in type && shallowEqual(inst.props, props));
  // Bailout: each child instance is passed back as its own element, so it keeps the props object it holds.
  if (equal && !inst.scheduled && !contextChanged) return visit(inst, inst.children, log);
  inst.props = props;
  return run(inst, log);
}

function run(inst: Instance, log: string[]): Instance {
  const { type } = inst;
  if (typeof type === 'object' && !('memo' in type)) return visit(inst, inst.props.children ?? [], log);
  const render = typeof type === 'function' ? type : type.memo;
  current = inst;
  cell = 0;
  inst.scheduled = false;
  inst.reads = undefined;
  log.push(render.name);
  const elements = render(inst.props);
  current = undefined;
  return visit(inst, elements, log);
}

function visit(inst: Instance, elements: readonly Element[], log: string[]): Instance {
  const context = typeof inst.type === 'object' && 'current' in inst.type ? inst.type : undefined;
  const outer = context?.current;
  if (context !== undefined) context.current = inst.props['value'];
  inst.children = elements.map((element, i) => update(inst.children[i], element, log));
  if (context !== undefined) context.current = outer;
  return inst;
}

/** Mounts `element`; `flush()` re-renders from the root and returns the names of the components that ran, in order. */
export function mount(element: Element): { readonly rendered: readonly string[]; flush(): string[] } {
  const rendered: string[] = [];
  const root = update(undefined, element, rendered);
  return { rendered, flush: () => { const log: string[] = []; update(root, root, log); return log; } };
}
