/**
 * Exhaustiveness helper. Call it in the `default` branch of a switch over a union:
 * if every member was handled, the argument is `never` and this compiles; add a union
 * member without handling it and the argument is that member, which is a type error.
 * The throw is the runtime backstop for data that lied about its type.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
