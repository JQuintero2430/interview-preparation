// Section 8 claim, about our model (tab-logout.ts): a logout announced by one tab reaches another tab's channel object
// and clears that tab's state once, and only our own message counts. The "tabs" are two BroadcastChannel objects in
// one Node process; this test assumes Node 24 delivers between channel objects of one thread (MDN says the message
// goes to every channel object of the name except the sender). No clock, no network.
import { TabLogout, isLogoutMessage } from './tab-logout';

const CHANNEL_NAME = 'lab-m42-auth';

describe('Module 42 · section 8, tabs', () => {
  it('Section 8: a logout posted in one tab clears the session in another', async () => {
    const tabB = { signedIn: true, heard: 0 };
    const cleared = Promise.withResolvers<void>();
    const sender = new TabLogout(new BroadcastChannel(CHANNEL_NAME), () => undefined);
    const listener = new TabLogout(new BroadcastChannel(CHANNEL_NAME), () => {
      tabB.signedIn = false;
      tabB.heard += 1;
      cleared.resolve();
    });

    try {
      sender.announce();
      await cleared.promise;

      expect(tabB.signedIn).toBe(false);
      expect(tabB.heard).toBe(1);
      // Anything else posted on the channel is not a logout.
      for (const other of ['logged-out', { type: 'logged-in' }, null, 42]) {
        expect(isLogoutMessage(other)).toBe(false);
      }
      expect(isLogoutMessage({ type: 'logged-out' })).toBe(true);
    } finally {
      sender.close();
      listener.close();
    }
  });
});
