// Our model of solid-js 1.9.17's update path, not Solid (read in dist/solid.js and web/dist/web.js, not run;
// writeSignal, runUpdates and insertExpression are internal): createSignal compares with equalFn (a === b);
// writeSignal re-runs the observers synchronously, inside runUpdates; createComponent calls the component inside
// untrack, so its body runs once and subscribes to nothing; insert wraps a function child in createRenderEffect
// and inserts any other value once. No owners, cleanup, batching, memos, stores or Transitions.

type Computation = () => void;
export type Child = string | number | (() => string | number);

let observer: Computation | undefined;

export function createSignal<T>(value: T): [read: () => T, write: (next: T) => void] {
  const observers = new Set<Computation>();
  const read = (): T => {
    if (observer !== undefined) observers.add(observer);
    return value;
  };
  const write = (next: T): void => {
    if (next === value) return; // equalFn: nothing is notified
    value = next;
    for (const run of [...observers]) run(); // synchronous, in the writing call
  };
  return [read, write];
}

function runAs<T>(current: Computation | undefined, fn: () => T): T {
  const outer = observer;
  observer = current;
  try {
    return fn();
  } finally {
    observer = outer;
  }
}

export const untrack = <T>(fn: () => T): T => runAs(undefined, fn);

export function createRenderEffect(fn: Computation): void {
  const run: Computation = () => runAs(run, fn);
  run();
}

export const createComponent = <P>(Comp: (props: P) => Node, props: P): Node => untrack(() => Comp(props));

/** Like solid-js/web's `insert`: a function child gets one render effect over its own text node; any other value is written once. */
export function insertText(parent: Node, child: Child): Text {
  const node = parent.appendChild(document.createTextNode(''));
  if (typeof child === 'function') createRenderEffect(() => { node.data = String(child()); });
  else node.data = String(child);
  return node;
}
