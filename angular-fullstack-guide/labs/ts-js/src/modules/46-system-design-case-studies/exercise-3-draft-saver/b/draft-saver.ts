// Exercise 46.3, variant b (the alternative): `reduce` turns (state, event) into the next state and a list of
// effects (arm or disarm the timer, send a save). The runner performs them: it asks a `Scheduler` for the timer and
// turns the API's answer back into an event. The test drives the scheduler by hand; no real or fake clock is used.
import type {
  Answers,
  DraftApi,
  DraftSaver,
  SaverOptions,
  SaveState,
  Scheduler,
  Theirs,
} from '../draft-saver';

export interface State {
  readonly latest: Answers;
  readonly base: string;
  readonly dirty: boolean;
  readonly inflight: boolean;
  readonly status: SaveState;
  readonly conflict: Theirs | null;
}

export type Event =
  | { readonly type: 'edit'; readonly answers: Answers }
  | { readonly type: 'pause' }
  | { readonly type: 'hidden' }
  | { readonly type: 'retry' }
  | { readonly type: 'saved'; readonly version: string }
  | { readonly type: 'conflict'; readonly theirs: Theirs }
  | { readonly type: 'failed' }
  | { readonly type: 'keep-mine' }
  | { readonly type: 'take-theirs' };

export type Effect =
  | { readonly type: 'arm' }
  | { readonly type: 'disarm' }
  | { readonly type: 'send'; readonly answers: Answers; readonly ifMatch: string };

export interface Step {
  readonly state: State;
  readonly effects: readonly Effect[];
}

const stay = (state: State): Step => ({ state, effects: [] });

/** Sends only when something waits, nothing is in flight and no conflict is open. */
function flush(state: State): Step {
  if (state.status === 'conflict' || state.inflight || !state.dirty) return stay(state);
  return {
    state: { ...state, inflight: true, dirty: false, status: 'saving' },
    effects: [{ type: 'disarm' }, { type: 'send', answers: state.latest, ifMatch: state.base }],
  };
}

export function reduce(state: State, event: Event): Step {
  switch (event.type) {
    case 'edit': {
      const status = state.status === 'conflict' ? 'conflict' : state.inflight ? 'saving' : 'unsaved';
      const next = { ...state, latest: event.answers, dirty: true, status } satisfies State;
      return { state: next, effects: status === 'conflict' ? [] : [{ type: 'arm' }] };
    }
    case 'pause':
    case 'hidden':
    case 'retry':
      return flush(state);
    case 'saved':
      return flush({ ...state, base: event.version, inflight: false, status: 'saved' });
    case 'conflict':
      return { state: { ...state, inflight: false, dirty: true, status: 'conflict', conflict: event.theirs }, effects: [{ type: 'disarm' }] };
    case 'failed':
      return stay({ ...state, inflight: false, dirty: true, status: 'unsaved' });
    case 'keep-mine':
      return state.conflict === null
        ? stay(state)
        : flush({ ...state, base: state.conflict.version, conflict: null, status: 'unsaved' });
    case 'take-theirs':
      return state.conflict === null
        ? stay(state)
        : stay({ ...state, latest: state.conflict.draft.answers, base: state.conflict.version, conflict: null, dirty: false, status: 'saved' });
  }
}

export class ReducerSaver implements DraftSaver {
  private model: State;
  private cancel: (() => void) | undefined;
  private readonly unsubscribe: () => void;

  constructor(
    private readonly api: DraftApi,
    private readonly options: SaverOptions,
    private readonly scheduler: Scheduler,
  ) {
    this.model = { latest: options.answers, base: options.version, dirty: false, inflight: false, status: 'saved', conflict: null };
    this.unsubscribe = options.visibility.onChange(() => {
      if (options.visibility.hidden) this.dispatch({ type: 'hidden' });
    });
  }

  edit(answers: Answers): void {
    this.dispatch({ type: 'edit', answers });
  }

  retry(): void {
    this.dispatch({ type: 'retry' });
  }

  keepMine(): void {
    this.dispatch({ type: 'keep-mine' });
  }

  takeTheirs(): void {
    this.dispatch({ type: 'take-theirs' });
  }

  state(): SaveState {
    return this.model.status;
  }

  answers(): Answers {
    return this.model.latest;
  }

  savedVersion(): string {
    return this.model.base;
  }

  theirs(): Theirs | null {
    return this.model.conflict;
  }

  dispose(): void {
    this.cancel?.();
    this.unsubscribe();
  }

  private dispatch(event: Event): void {
    const step = reduce(this.model, event);
    this.model = step.state;
    for (const effect of step.effects) this.run(effect);
  }

  private run(effect: Effect): void {
    if (effect.type === 'send') {
      void this.send(effect.answers, effect.ifMatch);
      return;
    }
    this.cancel?.();
    this.cancel = effect.type === 'arm' ? this.scheduler.after(this.options.pauseMs, () => this.dispatch({ type: 'pause' })) : undefined;
  }

  private async send(answers: Answers, ifMatch: string): Promise<void> {
    this.dispatch(await this.answerOf(answers, ifMatch));
  }

  private async answerOf(answers: Answers, ifMatch: string): Promise<Event> {
    try {
      const result = await this.api.save({ schemaVersion: this.options.schemaVersion, answers }, ifMatch);
      return result.status === 'saved'
        ? { type: 'saved', version: result.version }
        : { type: 'conflict', theirs: { draft: result.current, version: result.version } };
    } catch {
      return { type: 'failed' };
    }
  }
}
