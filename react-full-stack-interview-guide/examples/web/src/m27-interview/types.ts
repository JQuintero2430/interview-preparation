export type User = { id: number; name: string };

/** The fixed component passes a signal; the flawed one ignores it. A fake `(q, signal?)` fits both. */
export type SearchUsers = (query: string, signal: AbortSignal) => Promise<User[]>;
export type SearchUsersNoSignal = (query: string) => Promise<User[]>;
