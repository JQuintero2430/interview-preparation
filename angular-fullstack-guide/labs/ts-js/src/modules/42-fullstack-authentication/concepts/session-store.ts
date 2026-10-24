// Section 1 model: the server side of a session login. Our model, not Spring's code.
// It mirrors the idea in Spring Security 7.1.1 session-management.adoc and Spring Session 4.1.1 index.adoc: the server
// keeps a record per session id, and the browser holds only the id. Nothing here reads a clock or a random source:
// the caller injects the id generator.

export interface SessionRecord {
  readonly userId: string;
}

/** An in-memory session table keyed by session id, the shape a shared store such as Redis or a database table also has. */
export class SessionStore {
  private readonly records = new Map<string, SessionRecord>();

  /** @param newId - Source of session ids; a real server needs unguessable ones, a test passes a counter. */
  constructor(private readonly newId: () => string) {}

  /** Stores a record for the user and returns the session id the browser would hold in its cookie. */
  login(userId: string): string {
    const sessionId = this.newId();
    this.records.set(sessionId, { userId });
    return sessionId;
  }

  /** Returns the record a request's session id points at, or `undefined` when the id is unknown or revoked. */
  lookup(sessionId: string): SessionRecord | undefined {
    return this.records.get(sessionId);
  }

  /** Deletes one session. Returns whether a record existed. */
  revoke(sessionId: string): boolean {
    return this.records.delete(sessionId);
  }

  /** Deletes every session of a user, as when a support engineer disables an account. Returns how many were removed. */
  revokeUser(userId: string): number {
    const owned = [...this.records].filter(([, record]) => record.userId === userId);
    for (const [sessionId] of owned) this.records.delete(sessionId);
    return owned.length;
  }
}
