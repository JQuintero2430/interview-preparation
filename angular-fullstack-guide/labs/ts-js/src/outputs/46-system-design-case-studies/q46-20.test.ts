// Output question Q46.20: our unread set (concepts/unread.ts, our model, not a library's code) in two tabs. The server
// delivers to both tabs; a read in tab A reaches tab B through this file's own fake channel, which never echoes to the
// sending object (one channel object per tab, so "sender" equals "tab" only here; 45 section 8 owns the real
// BroadcastChannel statement). Plain values only: no real channel, storage, clock, randomness or network.
import { createUnread } from '../../modules/46-system-design-case-studies/concepts/unread';
import { captureLogs } from '../capture';

interface ReadMessage {
  readonly id: string;
}

interface Member {
  readonly onMessage: (message: ReadMessage) => void;
}

/** Our fake channel group: `open` returns one channel object whose `post` reaches every other object, never itself. */
function createChannelGroup() {
  const members: Member[] = [];
  return {
    open(onMessage: (message: ReadMessage) => void) {
      const self: Member = { onMessage };
      members.push(self);
      return {
        post(message: ReadMessage): void {
          for (const other of members) if (other !== self) other.onMessage(message);
        },
      };
    },
  };
}

function openTab(group: ReturnType<typeof createChannelGroup>) {
  const unread = createUnread();
  const channel = group.open((message) => unread.markRead(message.id));
  return { unread, channel };
}

describe('46 · Q46.20', () => {
  it('Q46.20 our unread set', async () => {
    const lines = await captureLogs((log) => {
      const group = createChannelGroup();
      const a = openTab(group);
      const b = openTab(group);
      const show = (event: string) => log(`${event}: A ${a.unread.count()}, B ${b.unread.count()}`);
      const deliver = (id: string) => {
        a.unread.deliver(id);
        b.unread.deliver(id);
      };
      const readInA = (id: string) => {
        a.unread.markRead(id);
        a.channel.post({ id });
      };

      deliver('n1');
      show('deliver n1');
      deliver('n2');
      show('deliver n2');
      deliver('n2');
      show('deliver n2 again');
      readInA('n3');
      show('read n3 (not delivered yet)');
      deliver('n3');
      show('deliver n3');
      readInA('n1');
      show('read n1');
    });

    expect(lines).toEqual([
      'deliver n1: A 1, B 1',
      'deliver n2: A 2, B 2',
      'deliver n2 again: A 2, B 2',
      'read n3 (not delivered yet): A 2, B 2',
      'deliver n3: A 2, B 2',
      'read n1: A 1, B 1',
    ]);
  });
});
