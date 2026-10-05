export type Nested<T> = T | readonly Nested<T>[];

/** Recursive flatten with a depth limit (like Array.prototype.flat). Holes become undefined (flat() skips them). */
export function flatten<T>(input: readonly Nested<T>[], depth = Infinity): T[] {
  const out: T[] = [];
  for (const item of input) {
    if (Array.isArray(item) && depth > 0) {
      for (const inner of flatten(item as readonly Nested<T>[], depth - 1)) out.push(inner);
      // not out.push(...flatten(...)): spreading a huge array into arguments can overflow the stack
    } else {
      out.push(item as T);
    }
  }
  return out;
}

/** Same result, explicit stack: survives nesting depths that overflow the call stack. */
export function flattenIterative<T>(input: readonly Nested<T>[], depth = Infinity): T[] {
  const out: T[] = [];
  const stack: Array<[Nested<T>, number]> = [];
  for (let i = input.length - 1; i >= 0; i--) stack.push([input[i] as Nested<T>, depth]);

  while (stack.length > 0) {
    const [item, remaining] = stack.pop() as [Nested<T>, number];
    if (Array.isArray(item) && remaining > 0) {
      const children = item as readonly Nested<T>[];
      for (let i = children.length - 1; i >= 0; i--) stack.push([children[i] as Nested<T>, remaining - 1]);
    } else {
      out.push(item as T);
    }
  }
  return out;
}
