// Section 7 claims, about our models (unread.ts, presence.ts), not a library's: a notification delivered twice
// counts once, a read receipt that arrives first still leaves the notification read, reading twice changes the
// count once, a read reaches other tabs through our fake channel and not the sender, and a presence entry expires
// when no heartbeat arrives within the time-to-live. Our model; one channel object per tab, so 'sender' equals 'tab'
// only here: the real BroadcastChannel excludes the sending object (45 section 8 owns that statement), and a page that
// shared one object between two tabs would not be modelled. Times are numbers the test passes; no clock, timer,
// network or randomness.
import { describe, expect, it } from 'vitest';
import { createPresence } from './presence';
import { createUnread } from './unread';

type ReadMessage = { readonly type: 'read'; readonly id: string };

/** Our fake channel group: `open` returns one channel object; its `post` reaches every other object, never itself. */
function createChannelGroup() {
  const members: Array<{ received: ReadMessage[]; onMessage: (message: ReadMessage) => void }> = [];
  return {
    open(onMessage: (message: ReadMessage) => void) {
      const member = { received: [] as ReadMessage[], onMessage };
      members.push(member);
      return {
        received: member.received,
        post(message: ReadMessage) {
          for (const other of members) {
            if (other === member) continue;
            other.received.push(message);
            other.onMessage(message);
          }
        },
      };
    },
  };
}

describe('Section 7: notifications and presence', () => {
  it('Section 7: a notification delivered twice counts once', () => {
    const unread = createUnread();
    unread.deliver('n7');
    unread.deliver('n7');
    unread.deliver('n8');
    expect(unread.count()).toBe(2);
  });

  it('Section 7: a read receipt that arrives before its notification still leaves it read', () => {
    const unread = createUnread();
    unread.markRead('n7');
    unread.deliver('n7');
    expect(unread.isUnread('n7')).toBe(false);
    expect(unread.count()).toBe(0);
  });

  it('Section 7: marking as read twice changes the count once', () => {
    const unread = createUnread();
    unread.deliver('n7');
    unread.deliver('n8');
    unread.markRead('n7');
    expect(unread.count()).toBe(1);
    unread.markRead('n7');
    expect(unread.count()).toBe(1);
  });

  it('Section 7: a read in one tab reaches the other tabs through our channel and not the sender', () => {
    const group = createChannelGroup();
    const tabs = ['A', 'B', 'C'].map(() => {
      const unread = createUnread();
      unread.deliver('n7');
      const channel = group.open((message) => unread.markRead(message.id));
      return { unread, channel };
    });
    const [a, b, c] = tabs as [(typeof tabs)[number], (typeof tabs)[number], (typeof tabs)[number]];

    // Tab A reads n7 itself (the writer updates itself), then tells the others.
    a.unread.markRead('n7');
    a.channel.post({ type: 'read', id: 'n7' });

    expect(b.unread.count()).toBe(0);
    expect(c.unread.count()).toBe(0);
    expect(b.channel.received).toEqual([{ type: 'read', id: 'n7' }]);
    expect(a.channel.received).toEqual([]);
  });

  it('Section 7: a presence entry expires when no heartbeat arrives within its time-to-live', () => {
    const presence = createPresence(45_000);
    presence.heartbeat('ana', 0);
    presence.heartbeat('ana', 15_000);
    expect(presence.present(59_999)).toEqual(['ana']);
    expect(presence.present(60_000)).toEqual([]);
    presence.heartbeat('ana', 61_000);
    expect(presence.present(61_000)).toEqual(['ana']);
  });
});
