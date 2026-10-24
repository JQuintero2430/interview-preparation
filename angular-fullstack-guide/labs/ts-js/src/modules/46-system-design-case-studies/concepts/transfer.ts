// Section 8 model: a money transfer intent against an idempotency store. Our model, mirroring
// draft-ietf-httpapi-idempotency-key-header-08 §2.6-§2.7 (an IETF Internet-Draft, read 2026-10-22); replaying the first
// response is our choice, as Stripe v1 documents; not a server's or Stripe's code. The server answers 400 without a key,
// 422 for a known key with a different payload (by our fingerprint), 409 while the first request is still processing,
// and the first response (201 and the same body) once it completed. A failing `apply` is not modeled. Plain values only:
// no clock, randomness, storage or network; `now` is passed in, keys come from an injected generator, and the business
// write (`apply`) is the test's, which can hold a request in progress until the test releases it.

export interface TransferPayload {
  readonly from: string;
  readonly to: string;
  /** 41 section 9's minor units: 25000 is 250.00 EUR. */
  readonly amountMinor: number;
  readonly currency: string;
}

export interface Transfer {
  readonly id: string;
  readonly payload: TransferPayload;
  readonly at: number;
}

export interface Problem {
  readonly type: string;
  readonly title: string;
}

type ProblemStatus = 400 | 409 | 422;

export type Answer =
  | { readonly status: 201; readonly body: Transfer }
  | { readonly status: ProblemStatus; readonly body: Problem };

/** Our status read by key (the draft defines no lookup): found, still processing, or never arrived. */
export type StatusRead =
  | { readonly status: 200; readonly body: Transfer }
  | { readonly status: 409; readonly body: Problem }
  | { readonly status: 404 };

/** The business write: moves the money once and returns the created transfer. */
export type Apply = (payload: TransferPayload, now: number) => Promise<Transfer>;

export interface IdempotentServer {
  post(key: string | undefined, payload: TransferPayload, now: number): Promise<Answer>;
  find(key: string): StatusRead;
}

interface Entry {
  readonly fingerprint: string;
  /** Undefined while the first request with this key is still processing. */
  transfer: Transfer | undefined;
}

const PROBLEM_TYPE = '/problems/idempotency';

// The titles of the draft's own 400, 409 and 422 examples (§2.7).
const PROBLEM_TITLES: Readonly<Record<ProblemStatus, string>> = {
  400: 'Idempotency-Key is missing',
  409: 'A request is outstanding for this Idempotency-Key',
  422: 'Idempotency-Key is already used',
};

function problem(status: ProblemStatus): { readonly status: ProblemStatus; readonly body: Problem } {
  return { status, body: { type: PROBLEM_TYPE, title: PROBLEM_TITLES[status] } };
}

/** Our fingerprint (draft-08 §2.4 lets the resource choose one): every payload field, in a fixed order. */
export function fingerprintOf(payload: TransferPayload): string {
  return [payload.from, payload.to, payload.amountMinor, payload.currency].join('|');
}

function answerFor(seen: Entry, fingerprint: string): Answer {
  if (seen.fingerprint !== fingerprint) return problem(422);
  return seen.transfer === undefined ? problem(409) : { status: 201, body: seen.transfer };
}

/**
 * Our server's idempotency layer in front of `apply`. The key is recorded as in progress before the money moves, so a
 * retry that arrives meanwhile gets 409 instead of a second `apply`.
 */
export function createIdempotentServer(apply: Apply): IdempotentServer {
  const keys = new Map<string, Entry>();

  return {
    async post(key, payload, now) {
      if (key === undefined || key === '') return problem(400);
      const fingerprint = fingerprintOf(payload);
      const seen = keys.get(key);
      if (seen !== undefined) return answerFor(seen, fingerprint);
      const entry: Entry = { fingerprint, transfer: undefined };
      keys.set(key, entry);
      entry.transfer = await apply(payload, now);
      return { status: 201, body: entry.transfer };
    },
    find(key) {
      const seen = keys.get(key);
      if (seen === undefined) return { status: 404 };
      return seen.transfer === undefined ? { status: 409, body: problem(409).body } : { status: 200, body: seen.transfer };
    },
  };
}

/** `submitting` and `unknown` are both shown as a pending row; only `succeeded` may show "sent". */
export type IntentState = 'submitting' | 'unknown' | 'succeeded' | 'failed';

/** One confirmed transfer: its payload, its key for every retry, and what the client knows. */
export interface Intent {
  readonly key: string;
  readonly payload: TransferPayload;
  readonly state: IntentState;
}

/** A response that never arrived (a timeout or a dropped connection). */
export const LOST = 'lost';

// A lookup table instead of a branch per status: 409 and 404 send the same key again, and only a lost response is unknown.
const NEXT_STATE: Readonly<Record<Answer['status'] | StatusRead['status'] | typeof LOST, IntentState>> = {
  201: 'succeeded',
  200: 'succeeded',
  409: 'submitting',
  404: 'submitting',
  400: 'failed',
  422: 'failed',
  lost: 'unknown',
};

/** Starts an intent when the user confirms; `newKey` is called once, so every retry of the intent carries one key. */
export function createIntent(payload: TransferPayload, newKey: () => string): Intent {
  return { key: newKey(), payload, state: 'submitting' };
}

/** The intent's next state after an answer, a status read, or a response that never arrived. Key and payload stay. */
export function settle(intent: Intent, response: Answer | StatusRead | typeof LOST): Intent {
  const status = response === LOST ? LOST : response.status;
  return { ...intent, state: NEXT_STATE[status] };
}
