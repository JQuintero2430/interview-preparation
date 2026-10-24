// Exercise 46.4, variant b (the alternative): `reduce` turns (state, message) into the next state and a list of
// effects (push, flush, discard, load, show, start, stop). The runner performs them: it owns the board and the
// interval, and turns the snapshot's answer back into a message. A failing snapshot request is not modeled.
import { createBoard, type Board, type DataHub, type HubEvent, type HubOptions, type Mode, type Snapshot } from '../hub';

export interface State {
  readonly mode: Mode;
  /** The sequence of the last snapshot shown; events at or below it are ignored. */
  readonly floor: number;
  /** Events that arrived while the snapshot was loading. */
  readonly held: readonly HubEvent[];
}

export type Message =
  | { readonly type: 'event'; readonly event: HubEvent }
  | { readonly type: 'tick' }
  | { readonly type: 'hidden' }
  | { readonly type: 'visible' }
  | { readonly type: 'snapshot'; readonly snapshot: Snapshot };

export type Effect =
  | { readonly type: 'push'; readonly event: HubEvent }
  | { readonly type: 'flush' }
  | { readonly type: 'discard' }
  | { readonly type: 'load' }
  | { readonly type: 'show'; readonly snapshot: Snapshot }
  | { readonly type: 'start' }
  | { readonly type: 'stop' };

export interface Step {
  readonly state: State;
  readonly effects: readonly Effect[];
}

const stay = (state: State): Step => ({ state, effects: [] });

function onEvent(state: State, event: HubEvent): Step {
  if (state.mode === 'hidden' || event.seq <= state.floor) return stay(state);
  if (state.mode === 'resyncing') return { state: { ...state, held: [...state.held, event] }, effects: [] };
  return { state, effects: [{ type: 'push', event }] };
}

function onSnapshot(state: State, snapshot: Snapshot): Step {
  if (state.mode !== 'resyncing') return stay(state);
  const newer = state.held.filter((event) => event.seq > snapshot.seq);
  return {
    state: { mode: 'visible', floor: snapshot.seq, held: [] },
    effects: [
      { type: 'show', snapshot },
      ...newer.map((event): Effect => ({ type: 'push', event })),
      { type: 'start' },
    ],
  };
}

export function reduce(state: State, message: Message): Step {
  switch (message.type) {
    case 'event':
      return onEvent(state, message.event);
    case 'tick':
      return state.mode === 'visible' ? { state, effects: [{ type: 'flush' }] } : stay(state);
    case 'hidden':
      return state.mode === 'hidden'
        ? stay(state)
        : { state: { ...state, mode: 'hidden', held: [] }, effects: [{ type: 'stop' }, { type: 'discard' }] };
    case 'visible':
      return state.mode === 'hidden' ? { state: { ...state, mode: 'resyncing' }, effects: [{ type: 'load' }] } : stay(state);
    case 'snapshot':
      return onSnapshot(state, message.snapshot);
  }
}

export class MachineHub implements DataHub {
  private model: State;
  private readonly board: Board;
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly unsubscribe: readonly (() => void)[];

  constructor(private readonly options: HubOptions) {
    this.board = createBoard(options);
    this.model = { mode: options.visibility.hidden ? 'hidden' : 'visible', floor: 0, held: [] };
    if (this.model.mode === 'visible') this.run({ type: 'start' });
    this.unsubscribe = [
      options.stream.subscribe((event) => this.dispatch({ type: 'event', event })),
      options.visibility.onChange(() => this.dispatch({ type: options.visibility.hidden ? 'hidden' : 'visible' })),
    ];
  }

  status(widgetId: string) {
    return this.board.status(widgetId);
  }

  view() {
    return this.board.view();
  }

  series(widgetId: string) {
    return this.board.series(widgetId);
  }

  dispose(): void {
    this.run({ type: 'stop' });
    for (const off of this.unsubscribe) off();
  }

  private dispatch(message: Message): void {
    const step = reduce(this.model, message);
    this.model = step.state;
    for (const effect of step.effects) this.run(effect);
  }

  private run(effect: Effect): void {
    switch (effect.type) {
      case 'push':
        return this.board.push(effect.event);
      case 'flush':
        return this.board.flush();
      case 'discard':
        return this.board.discard();
      case 'show':
        return this.board.show(effect.snapshot);
      case 'load':
        return void this.options.snapshots.load().then((snapshot) => this.dispatch({ type: 'snapshot', snapshot }));
      case 'start':
        clearInterval(this.timer);
        this.timer = setInterval(() => this.dispatch({ type: 'tick' }), this.options.windowMs);
        return;
      case 'stop':
        clearInterval(this.timer);
        return;
    }
  }
}
