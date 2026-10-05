/** Throws during render: the simplest way to trigger an error boundary in a test. */
export function Bomb({ message = 'boom' }: { message?: string }): never {
  throw new Error(message);
}

/** The text of any thrown value. JavaScript can throw strings, objects, even `null`. */
export function messageOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}
