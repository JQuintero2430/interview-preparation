// Exercise 46.5, variant a (the solution): a class. A confirm makes one intent and its key (section 8's
// `createIntent`), stores it and posts; every answer goes through `settle`. Still unsettled after a post: wait and post
// again with the same key, or, once `maxAttempts` posts are spent, read the status by key. Still unsettled after a
// status read (404: never arrived; 409: still processing): wait and post again with the same key. Our model.
import { createIntent, LOST, settle } from '../../concepts/transfer';
import {
  isUnsettled,
  loadIntent,
  storeIntent,
  type Answer,
  type ClientState,
  type Intent,
  type Policy,
  type Ports,
  type StatusRead,
  type TransferClient,
  type TransferPayload,
} from '../transfer-client';

export class TransferClientA implements TransferClient {
  private intent: Intent | null = null;
  private attempts = 0;
  private disposed = false;
  private cancel: () => void = () => undefined;

  constructor(
    private readonly ports: Ports,
    private readonly policy: Policy,
  ) {}

  confirm(payload: TransferPayload): void {
    if (isUnsettled(this.intent)) return;
    this.begin(createIntent(payload, this.ports.newKey));
  }

  resume(): void {
    const saved = loadIntent(this.ports.storage);
    if (saved !== null && !isUnsettled(this.intent)) this.begin(saved);
  }

  state(): ClientState {
    return this.intent?.state ?? 'idle';
  }

  dispose(): void {
    this.disposed = true;
    this.cancel();
  }

  private begin(intent: Intent): void {
    this.attempts = 0;
    this.update(intent);
    void this.post(intent);
  }

  private update(intent: Intent): void {
    this.intent = intent;
    storeIntent(this.ports.storage, intent);
    this.policy.onChange(intent.state);
  }

  private async post(intent: Intent): Promise<void> {
    this.attempts += 1;
    const answer = await this.ports.api.post(intent.key, intent.payload).catch((): typeof LOST => LOST);
    if (!this.settleWith(answer)) return;
    if (this.attempts < this.policy.maxAttempts) this.later(intent);
    else void this.read(intent);
  }

  private async read(intent: Intent): Promise<void> {
    const found = await this.ports.api.findByKey(intent.key).catch((): typeof LOST => LOST);
    if (this.settleWith(found)) this.later(intent);
  }

  /** Applies an answer; true while the intent still has no final answer and this page is still open. */
  private settleWith(response: Answer | StatusRead | typeof LOST): boolean {
    if (this.disposed || this.intent === null) return false;
    this.update(settle(this.intent, response));
    return isUnsettled(this.intent);
  }

  private later(intent: Intent): void {
    this.cancel = this.ports.scheduler.after(this.policy.retryDelayMs, () => void this.post(intent));
  }
}
