// Exercise 46.5: what both variants share (a: a class; b: a reducer whose effects a runner performs). Our model, not
// a library's, a bank's or a server's code. `concepts/transfer.ts` (section 8) is imported read-only: `createIntent`
// makes the one key of an intent and `settle` maps every answer to the intent's next state, so a lost response is
// `unknown`, never `failed`. The API, the storage, the scheduler and the key generator are injected, so a test needs
// no network, clock, randomness or real storage.
import type { Answer, Intent, IntentState, StatusRead, TransferPayload } from '../concepts/transfer';

export type { Answer, Intent, IntentState, StatusRead, TransferPayload };

/** Our stand-in for the transfer endpoints. `post` rejects when no response arrives (a timeout). */
export interface TransferApi {
  post(key: string, payload: TransferPayload): Promise<Answer>;
  /** Our status read by key (section 8's contract; the draft defines no lookup): 200 found, 409 processing, 404 never arrived. */
  findByKey(key: string): Promise<StatusRead>;
}

/** The part of the Web Storage API the client uses. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Runs `task` after `ms` and returns a cancel function. A test advances it by hand. */
export interface Scheduler {
  after(ms: number, task: () => void): () => void;
}

/** The client's four collaborators. */
export interface Ports {
  readonly api: TransferApi;
  readonly storage: KeyValueStorage;
  readonly scheduler: Scheduler;
  readonly newKey: () => string;
}

export interface Policy {
  /** Posts of one intent before the client reads its status by key. */
  readonly maxAttempts: number;
  readonly retryDelayMs: number;
  /** Called with the intent's state after every answer, so a screen can show pending, "checking" or the outcome. */
  readonly onChange: (state: IntentState) => void;
}

/** `idle` before the first confirm; `submitting` and `unknown` are both shown as a pending row. */
export type ClientState = 'idle' | IntentState;

export interface TransferClient {
  /** The user confirmed this transfer. Ignored while an intent has no final answer. */
  confirm(payload: TransferPayload): void;
  /** After a reload: continues the persisted intent with its key. */
  resume(): void;
  state(): ClientState;
  /** The page is gone: cancels the retry timer and ignores answers that arrive later. */
  dispose(): void;
}

export const STORAGE_KEY = 'transfer-intent';

/** No final answer yet (`submitting` or `unknown`): the intent stays in storage and the button stays disabled. */
export function isUnsettled(intent: Intent | null): boolean {
  return intent !== null && (intent.state === 'submitting' || intent.state === 'unknown');
}

/** Keeps an unsettled intent's key and payload in storage, and removes the entry once the intent is settled. */
export function storeIntent(storage: KeyValueStorage, intent: Intent): void {
  if (isUnsettled(intent)) storage.setItem(STORAGE_KEY, JSON.stringify({ key: intent.key, payload: intent.payload }));
  else storage.removeItem(STORAGE_KEY);
}

function isPayload(value: unknown): value is TransferPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'from' in value &&
    typeof value.from === 'string' &&
    'to' in value &&
    typeof value.to === 'string' &&
    'amountMinor' in value &&
    typeof value.amountMinor === 'number' &&
    'currency' in value &&
    typeof value.currency === 'string'
  );
}

/** The stored entry parsed, or null when it is missing or not JSON (another version of the page may have written it). */
function parseStored(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

/** The persisted intent, if any, as `unknown`: after a reload the client cannot know whether its last request arrived. */
export function loadIntent(storage: KeyValueStorage): Intent | null {
  const saved = parseStored(storage.getItem(STORAGE_KEY));
  if (typeof saved !== 'object' || saved === null || !('key' in saved) || typeof saved.key !== 'string') return null;
  if (!('payload' in saved) || !isPayload(saved.payload)) return null;
  return { key: saved.key, payload: saved.payload, state: 'unknown' };
}
