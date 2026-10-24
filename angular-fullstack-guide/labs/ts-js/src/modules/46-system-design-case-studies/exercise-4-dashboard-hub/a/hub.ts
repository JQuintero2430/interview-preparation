// Exercise 46.4, variant a (the solution): a class with one interval per window. Hidden stops the interval and drops
// the open window; visible loads one snapshot, holds the events that arrive meanwhile, then shows the snapshot,
// applies the held events above its sequence and restarts the interval. The interval is the global `setInterval`,
// which a test replaces with fake timers. A failing snapshot request is not modeled.
import { createBoard, type Board, type DataHub, type HubEvent, type HubOptions, type Mode } from '../hub';

export class DashboardHub implements DataHub {
  private readonly board: Board;
  private mode: Mode;
  private floor = 0;
  private held: HubEvent[] = [];
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly unsubscribe: readonly (() => void)[];

  constructor(private readonly options: HubOptions) {
    this.board = createBoard(options);
    this.mode = options.visibility.hidden ? 'hidden' : 'visible';
    if (this.mode === 'visible') this.start();
    this.unsubscribe = [
      options.stream.subscribe((event) => this.onEvent(event)),
      options.visibility.onChange(() => this.onVisibility()),
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
    this.stop();
    for (const off of this.unsubscribe) off();
  }

  private onEvent(event: HubEvent): void {
    if (this.mode === 'hidden' || event.seq <= this.floor) return;
    if (this.mode === 'resyncing') this.held.push(event);
    else this.board.push(event);
  }

  private onVisibility(): void {
    if (this.options.visibility.hidden && this.mode !== 'hidden') {
      this.mode = 'hidden';
      this.held = [];
      this.stop();
      this.board.discard();
    } else if (!this.options.visibility.hidden && this.mode === 'hidden') {
      this.mode = 'resyncing';
      void this.resync();
    }
  }

  private async resync(): Promise<void> {
    const snapshot = await this.options.snapshots.load();
    if (this.mode !== 'resyncing') return;
    this.floor = snapshot.seq;
    this.board.show(snapshot);
    for (const event of this.held) if (event.seq > snapshot.seq) this.board.push(event);
    this.held = [];
    this.mode = 'visible';
    this.start();
  }

  private start(): void {
    this.stop();
    this.timer = setInterval(() => this.board.flush(), this.options.windowMs);
  }

  private stop(): void {
    clearInterval(this.timer);
  }
}
