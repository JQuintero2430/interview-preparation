// Exercise 46.3, variant a (the solution): a class with one timer. Every edit restarts the timer, so only a pause
// sends; `flush` sends only when nothing is in flight and no conflict is open, and a save that settles while newer
// answers wait sends them at once. The timer is the global `setTimeout`, which a test replaces with fake timers.
import type {
  Answers,
  DraftApi,
  DraftSaver,
  SaveResult,
  SaverOptions,
  SaveState,
  Theirs,
} from '../draft-saver';

export class TimerDraftSaver implements DraftSaver {
  private latest: Answers;
  private base: string;
  private dirty = false;
  private inflight = false;
  private status: SaveState = 'saved';
  private conflict: Theirs | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly unsubscribe: () => void;

  constructor(
    private readonly api: DraftApi,
    private readonly options: SaverOptions,
  ) {
    this.latest = options.answers;
    this.base = options.version;
    this.unsubscribe = options.visibility.onChange(() => {
      if (options.visibility.hidden) this.flush();
    });
  }

  edit(answers: Answers): void {
    this.latest = answers;
    this.dirty = true;
    if (this.status === 'conflict') return;
    if (!this.inflight) this.status = 'unsaved';
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.options.pauseMs);
  }

  retry(): void {
    this.flush();
  }

  keepMine(): void {
    if (this.conflict === null) return;
    this.base = this.conflict.version;
    this.conflict = null;
    this.status = 'unsaved';
    this.flush();
  }

  takeTheirs(): void {
    if (this.conflict === null) return;
    this.latest = this.conflict.draft.answers;
    this.base = this.conflict.version;
    this.conflict = null;
    this.dirty = false;
    this.status = 'saved';
  }

  state(): SaveState {
    return this.status;
  }

  answers(): Answers {
    return this.latest;
  }

  savedVersion(): string {
    return this.base;
  }

  theirs(): Theirs | null {
    return this.conflict;
  }

  dispose(): void {
    clearTimeout(this.timer);
    this.unsubscribe();
  }

  private flush(): void {
    clearTimeout(this.timer);
    if (this.status === 'conflict' || this.inflight || !this.dirty) return;
    this.inflight = true;
    this.dirty = false;
    this.status = 'saving';
    void this.send(this.latest, this.base);
  }

  private async send(answers: Answers, ifMatch: string): Promise<void> {
    let result: SaveResult;
    try {
      result = await this.api.save({ schemaVersion: this.options.schemaVersion, answers }, ifMatch);
    } catch {
      this.inflight = false;
      this.dirty = true;
      this.status = 'unsaved';
      return;
    }
    this.inflight = false;
    if (result.status === 'saved') {
      this.base = result.version;
      this.status = 'saved';
      this.flush();
    } else {
      this.dirty = true;
      this.status = 'conflict';
      this.conflict = { draft: result.current, version: result.version };
    }
  }
}
