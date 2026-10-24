// Exercise 46.5, variant b (the alternative): `reduce` turns (state, event) into the next state and a list of effects
// and is pure, so every decision can be tested without a scheduler or an API. The runner performs the effects: it
// makes the intent (the key generator is a side effect, so the reducer only asks for it), stores it, posts, reads the
// status by key and arms the retry timer, then turns each answer back into an event. Our model.
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

export interface State {
  readonly intent: Intent | null;
  /** Posts sent for the current intent. */
  readonly attempts: number;
  readonly maxAttempts: number;
}

export type Event =
  | { readonly type: 'confirm'; readonly payload: TransferPayload }
  | { readonly type: 'started'; readonly intent: Intent }
  | { readonly type: 'answered'; readonly response: Answer | typeof LOST }
  | { readonly type: 'read'; readonly response: StatusRead | typeof LOST }
  | { readonly type: 'retry' };

export type Effect =
  | { readonly type: 'create'; readonly payload: TransferPayload }
  | { readonly type: 'store'; readonly intent: Intent }
  | { readonly type: 'post'; readonly intent: Intent }
  | { readonly type: 'read'; readonly intent: Intent }
  | { readonly type: 'wait' };

export interface Step {
  readonly state: State;
  readonly effects: readonly Effect[];
}

const stay = (state: State): Step => ({ state, effects: [] });

function afterPost(state: State, intent: Intent, response: Answer | typeof LOST): Step {
  const next = settle(intent, response);
  const effects: Effect[] = [{ type: 'store', intent: next }];
  if (isUnsettled(next)) effects.push(state.attempts < state.maxAttempts ? { type: 'wait' } : { type: 'read', intent: next });
  return { state: { ...state, intent: next }, effects };
}

function afterRead(state: State, intent: Intent, response: StatusRead | typeof LOST): Step {
  const next = settle(intent, response);
  const effects: Effect[] = [{ type: 'store', intent: next }];
  if (isUnsettled(next)) effects.push({ type: 'wait' });
  return { state: { ...state, intent: next }, effects };
}

export function reduce(state: State, event: Event): Step {
  if (event.type === 'confirm') {
    return isUnsettled(state.intent) ? stay(state) : { state, effects: [{ type: 'create', payload: event.payload }] };
  }
  if (event.type === 'started') {
    if (isUnsettled(state.intent)) return stay(state);
    const intent = event.intent;
    return { state: { ...state, intent, attempts: 1 }, effects: [{ type: 'store', intent }, { type: 'post', intent }] };
  }
  const intent = state.intent;
  if (intent === null) return stay(state);
  switch (event.type) {
    case 'answered':
      return afterPost(state, intent, event.response);
    case 'read':
      return afterRead(state, intent, event.response);
    case 'retry':
      return { state: { ...state, attempts: state.attempts + 1 }, effects: [{ type: 'post', intent }] };
  }
}

export class TransferClientB implements TransferClient {
  private model: State;
  private disposed = false;
  private cancel: () => void = () => undefined;

  constructor(
    private readonly ports: Ports,
    private readonly policy: Policy,
  ) {
    this.model = { intent: null, attempts: 0, maxAttempts: policy.maxAttempts };
  }

  confirm(payload: TransferPayload): void {
    this.dispatch({ type: 'confirm', payload });
  }

  resume(): void {
    const saved = loadIntent(this.ports.storage);
    if (saved !== null) this.dispatch({ type: 'started', intent: saved });
  }

  state(): ClientState {
    return this.model.intent?.state ?? 'idle';
  }

  dispose(): void {
    this.disposed = true;
    this.cancel();
  }

  private dispatch(event: Event): void {
    if (this.disposed) return;
    const step = reduce(this.model, event);
    this.model = step.state;
    for (const effect of step.effects) this.run(effect);
  }

  private run(effect: Effect): void {
    const { api, scheduler, storage, newKey } = this.ports;
    switch (effect.type) {
      case 'create':
        return this.dispatch({ type: 'started', intent: createIntent(effect.payload, newKey) });
      case 'store':
        storeIntent(storage, effect.intent);
        return this.policy.onChange(effect.intent.state);
      case 'post':
        void api
          .post(effect.intent.key, effect.intent.payload)
          .catch((): typeof LOST => LOST)
          .then((response) => this.dispatch({ type: 'answered', response }));
        return;
      case 'read':
        void api
          .findByKey(effect.intent.key)
          .catch((): typeof LOST => LOST)
          .then((response) => this.dispatch({ type: 'read', response }));
        return;
      case 'wait':
        this.cancel = scheduler.after(this.policy.retryDelayMs, () => this.dispatch({ type: 'retry' }));
        return;
    }
  }
}
