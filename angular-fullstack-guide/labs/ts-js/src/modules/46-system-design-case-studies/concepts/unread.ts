// Section 7 model: the unread state of a notifications center as two sets of ids. Our model, not a library's code.
// The count is derived, never incremented, so a duplicate delivery, a repeated read and a read receipt that arrives
// before its notification cannot make it drift. Plain values only: no channel, stream, storage, clock, randomness or
// network; the transport is 43 section 1 and 2's, and the tab-to-tab message is the test's fake channel.

export interface Unread {
  /** A notification arrived (live, or again by catch-up). Delivering a known id changes nothing. */
  deliver(id: string): void;
  /** A read receipt. It is remembered even when the notification has not arrived yet. */
  markRead(id: string): void;
  /** Delivered ids with no read receipt. */
  count(): number;
  isUnread(id: string): boolean;
}

export function createUnread(): Unread {
  const delivered = new Set<string>();
  const read = new Set<string>();

  return {
    deliver(id) {
      delivered.add(id);
    },
    markRead(id) {
      read.add(id);
    },
    count() {
      return [...delivered].filter((id) => !read.has(id)).length;
    },
    isUnread(id) {
      return delivered.has(id) && !read.has(id);
    },
  };
}
