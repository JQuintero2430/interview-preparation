// Section 7 model: an editing indicator as a map from user to the time of the last heartbeat. Our model, not a
// standard's or a product's: the guide read no presence specification (a STOMP heart-beat is connection liveness,
// 43 section 5, not presence). An entry is present while its last heartbeat is younger than the time-to-live, so a
// user who never says goodbye (a closed laptop) disappears by time alone. Time is a number the caller passes: no
// clock, timer, socket, randomness or network. Presence is a hint, not a lock: nothing here refuses an edit.

export interface Presence {
  /** Records that `user` was active at `now` (milliseconds); a later heartbeat renews the entry. */
  heartbeat(user: string, now: number): void;
  /** The users whose last heartbeat is less than the time-to-live old at `now`. */
  present(now: number): readonly string[];
}

export function createPresence(ttlMs: number): Presence {
  const lastBeat = new Map<string, number>();

  return {
    heartbeat(user, now) {
      lastBeat.set(user, now);
    },
    present(now) {
      return [...lastBeat].filter(([, at]) => now - at < ttlMs).map(([user]) => user);
    },
  };
}
