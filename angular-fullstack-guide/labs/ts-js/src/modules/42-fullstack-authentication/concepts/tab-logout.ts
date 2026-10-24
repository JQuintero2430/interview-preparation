// Section 8 model: telling the other tabs of one origin that the user signed out. Our model, not a library's code.
// A BroadcastChannel (MDN, read 2026-10-20) lets same-origin tabs exchange messages by channel name; each tab hears
// every message except the ones its own channel object sent. The message carries the event only, never a token, and
// a tab that hears it clears its own page state. The server session is ended by the BFF's POST /logout, not here.

export const LOGGED_OUT = 'logged-out';

export interface LogoutMessage {
  readonly type: typeof LOGGED_OUT;
}

/** True only for our own message; anything else posted on the channel is ignored. */
export function isLogoutMessage(data: unknown): data is LogoutMessage {
  return typeof data === 'object' && data !== null && 'type' in data && data.type === LOGGED_OUT;
}

export class TabLogout {
  /**
   * @param channel - One tab's channel object; the page creates it with the shared channel name.
   * @param onLoggedOut - Runs in this tab when another tab announces a logout.
   */
  constructor(
    private readonly channel: BroadcastChannel,
    onLoggedOut: () => void,
  ) {
    channel.addEventListener('message', (event) => {
      if (isLogoutMessage(event.data)) onLoggedOut();
    });
  }

  /** Tells every other tab; call it after this tab's own logout has started. */
  announce(): void {
    this.channel.postMessage({ type: LOGGED_OUT } satisfies LogoutMessage);
  }

  close(): void {
    this.channel.close();
  }
}
