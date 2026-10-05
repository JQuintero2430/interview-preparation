// A fake backend for module 14. There is no network: every endpoint awaits `respond()`.
// Auto mode (default): each response arrives on the next macrotask, so tests use findBy/waitFor.
// Held mode: responses wait until the test calls resolveNext() or rejectNext(), so a test can
// look at the UI while a request is still in flight and decide exactly when (and how) it ends.

type Waiting = { label: string; resolve: () => void; reject: (error: Error) => void };

let held = false;
let nextFailure: string | null = null;
const waiting: Waiting[] = [];
const registeredEmails = new Set<string>();
const posts = new Map<string, { liked: boolean; likes: number }>();

function respond(label: string): Promise<void> {
  if (held) {
    return new Promise((resolve, reject) => {
      waiting.push({ label, resolve: () => resolve(), reject });
    });
  }
  const failure = nextFailure;
  nextFailure = null;
  return new Promise((resolve, reject) => {
    setTimeout(() => (failure === null ? resolve() : reject(new Error(failure))), 0);
  });
}

function takeNext(): Waiting {
  const next = waiting.shift();
  if (!next) throw new Error('No request is waiting for a response');
  return next;
}

export const fakeServer = {
  /** Hold every response until the test settles it. */
  hold() {
    held = true;
  },
  /** In auto mode, make the next request fail with this message. */
  failNextRequest(message: string) {
    nextFailure = message;
  },
  /** Labels of the requests that are in flight, oldest first. */
  pending: () => waiting.map((w) => w.label),
  resolveNext() {
    takeNext().resolve();
  },
  rejectNext(message: string) {
    takeNext().reject(new Error(message));
  },
  reset() {
    held = false;
    nextFailure = null;
    waiting.length = 0;
    registeredEmails.clear();
    registeredEmails.add('taken@example.com');
    posts.clear();
    posts.set('post-1', { liked: false, likes: 10 });
  },
};
fakeServer.reset();

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; field: 'email'; message: string };

/** Business-rule failures come back as data; only transport failures reject. */
export async function registerUser(input: { email: string; password: string }): Promise<RegisterResult> {
  await respond(`register ${input.email}`);
  const email = input.email.toLowerCase();
  if (registeredEmails.has(email)) {
    return { ok: false, field: 'email', message: 'This email is already registered' };
  }
  registeredEmails.add(email);
  return { ok: true, userId: `user-${registeredEmails.size}` };
}

export async function setLike(postId: string, liked: boolean): Promise<{ liked: boolean; likes: number }> {
  await respond(`like ${postId} ${liked}`);
  const post = posts.get(postId) ?? { liked: false, likes: 0 };
  const next = post.liked === liked ? post : { liked, likes: post.likes + (liked ? 1 : -1) };
  posts.set(postId, next);
  return next;
}

export async function subscribe(email: string): Promise<void> {
  await respond(`subscribe ${email}`);
  if (email.endsWith('@blocked.test')) throw new Error('This domain cannot subscribe');
}

export async function addToCart(quantity: number): Promise<void> {
  await respond(`add ${quantity}`);
}

export async function placeOrder(order: { email: string; fullName: string; address: string }): Promise<string> {
  await respond(`order ${order.email}`);
  return 'order-1';
}
