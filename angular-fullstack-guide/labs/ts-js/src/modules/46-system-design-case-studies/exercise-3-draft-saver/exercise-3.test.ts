// Exercise 46.3: six criteria, each run over both variants (a: a class on the global timer, driven by Vitest fake
// timers; b: a reducer whose scheduler the test advances by hand). `FakeDraftApi` is our server: it keeps a version
// that grows by one per accepted save, and can hold a save in flight, fail once, or answer one conflict. The page's
// visibility is our `FakeVisibility`. No network, real clock or randomness.
import * as a from './a/draft-saver';
import * as b from './b/draft-saver';
import type { Draft, DraftApi, DraftSaver, SaveResult, Scheduler, Visibility } from './draft-saver';

const PAUSE = 1000;

class FakeDraftApi implements DraftApi {
  readonly calls: { draft: Draft; ifMatch: string }[] = [];
  hold = false;
  failNext = false;
  conflictWith: Draft | null = null;
  private version = 1;
  private readonly gates: (() => void)[] = [];

  async save(draft: Draft, ifMatch: string): Promise<SaveResult> {
    this.calls.push({ draft, ifMatch });
    if (this.hold) await new Promise<void>((resolve) => this.gates.push(resolve));
    if (this.failNext) {
      this.failNext = false;
      throw new Error('network');
    }
    this.version += 1;
    if (this.conflictWith !== null) {
      const current = this.conflictWith;
      this.conflictWith = null;
      return { status: 'conflict', current, version: String(this.version) };
    }
    return { status: 'saved', version: String(this.version) };
  }

  /** Lets the oldest held save answer. */
  release(): void {
    this.gates.shift()?.();
  }
}

class FakeVisibility implements Visibility {
  hidden = false;
  private readonly listeners = new Set<() => void>();

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  set(hidden: boolean): void {
    this.hidden = hidden;
    for (const listener of this.listeners) listener();
  }
}

class ManualScheduler implements Scheduler {
  private now = 0;
  private nextId = 0;
  private readonly tasks = new Map<number, { due: number; run: () => void }>();

  after(ms: number, run: () => void): () => void {
    const id = this.nextId++;
    this.tasks.set(id, { due: this.now + ms, run });
    return () => {
      this.tasks.delete(id);
    };
  }

  advance(ms: number): void {
    this.now += ms;
    for (const [id, task] of [...this.tasks]) {
      if (task.due <= this.now && this.tasks.delete(id)) task.run();
    }
  }
}

/** Lets every promise already resolved run its continuation. */
async function settle(): Promise<void> {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
}

describe.each(['a', 'b'])('Exercise 46.3, variant %s', (variant) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(): { api: FakeDraftApi; visibility: FakeVisibility; saver: DraftSaver; elapse: (ms: number) => Promise<void> } {
    const api = new FakeDraftApi();
    const visibility = new FakeVisibility();
    const scheduler = new ManualScheduler();
    const options = { answers: {}, schemaVersion: 2, version: '1', pauseMs: PAUSE, visibility };
    const saver = variant === 'a' ? new a.TimerDraftSaver(api, options) : new b.ReducerSaver(api, options, scheduler);
    const elapse = async (ms: number): Promise<void> => {
      if (variant === 'a') {
        await vi.advanceTimersByTimeAsync(ms);
      } else {
        scheduler.advance(ms);
      }
      await settle();
    };
    return { api, visibility, saver, elapse };
  }

  it('saves once after a pause in editing, with the latest answers', async () => {
    const { api, saver, elapse } = setup();
    saver.edit({ name: 'A' });
    await elapse(500);
    saver.edit({ name: 'An' });
    await elapse(PAUSE - 1);
    expect(api.calls).toHaveLength(0);
    expect(saver.state()).toBe('unsaved');
    await elapse(1);
    expect(api.calls.map((call) => call.draft)).toEqual([{ schemaVersion: 2, answers: { name: 'An' } }]);
    expect(saver.state()).toBe('saved');
  });

  it('keeps one save in flight and sends the newest answers once it settles', async () => {
    const { api, saver, elapse } = setup();
    api.hold = true;
    saver.edit({ n: '1' });
    await elapse(PAUSE);
    expect(saver.state()).toBe('saving');
    saver.edit({ n: '2' });
    await elapse(PAUSE);
    saver.edit({ n: '3' });
    await elapse(PAUSE);
    expect(api.calls).toHaveLength(1);
    api.hold = false;
    api.release();
    await settle();
    expect(api.calls.map((call) => call.draft.answers)).toEqual([{ n: '1' }, { n: '3' }]);
    expect(saver.state()).toBe('saved');
  });

  it('sends the last saved version as If-Match and stores the new version after a save', async () => {
    const { api, saver, elapse } = setup();
    saver.edit({ n: '1' });
    await elapse(PAUSE);
    expect(saver.savedVersion()).toBe('2');
    saver.edit({ n: '2' });
    await elapse(PAUSE);
    expect(api.calls.map((call) => call.ifMatch)).toEqual(['1', '2']);
    expect(saver.savedVersion()).toBe('3');
  });

  it("on a conflict, keeps the user's answers, exposes the server's draft, and does not save again until the user resolves it", async () => {
    const mine = setup();
    mine.api.conflictWith = { schemaVersion: 2, answers: { n: 'theirs' } };
    mine.saver.edit({ n: 'mine' });
    await mine.elapse(PAUSE);
    expect(mine.saver.state()).toBe('conflict');
    expect(mine.saver.answers()).toEqual({ n: 'mine' });
    expect(mine.saver.theirs()?.draft.answers).toEqual({ n: 'theirs' });
    mine.saver.edit({ n: 'mine 2' });
    await mine.elapse(5 * PAUSE);
    mine.saver.retry();
    await settle();
    expect(mine.api.calls).toHaveLength(1);
    expect(mine.saver.answers()).toEqual({ n: 'mine 2' });
    mine.saver.keepMine();
    await settle();
    expect(mine.api.calls.map((call) => call.ifMatch)).toEqual(['1', '2']);
    expect(mine.api.calls[1]?.draft.answers).toEqual({ n: 'mine 2' });
    expect(mine.saver.state()).toBe('saved');

    const theirs = setup();
    theirs.api.conflictWith = { schemaVersion: 2, answers: { n: 'theirs' } };
    theirs.saver.edit({ n: 'mine' });
    await theirs.elapse(PAUSE);
    theirs.saver.takeTheirs();
    expect(theirs.saver.answers()).toEqual({ n: 'theirs' });
    expect(theirs.saver.state()).toBe('saved');
    expect(theirs.saver.savedVersion()).toBe('2');
    expect(theirs.api.calls).toHaveLength(1);
  });

  it('after a network error, marks the draft unsaved and retries on the next edit or an explicit retry', async () => {
    const { api, saver, elapse } = setup();
    api.failNext = true;
    saver.edit({ n: '1' });
    await elapse(PAUSE);
    expect(saver.state()).toBe('unsaved');
    await elapse(5 * PAUSE);
    expect(api.calls).toHaveLength(1);
    saver.edit({ n: '2' });
    await elapse(PAUSE);
    expect(api.calls.map((call) => call.draft.answers)).toEqual([{ n: '1' }, { n: '2' }]);
    expect(saver.state()).toBe('saved');
    api.failNext = true;
    saver.edit({ n: '3' });
    await elapse(PAUSE);
    expect(saver.state()).toBe('unsaved');
    saver.retry();
    await settle();
    expect(api.calls.map((call) => call.ifMatch)).toEqual(['1', '1', '2', '2']);
    expect(api.calls[3]?.draft.answers).toEqual({ n: '3' });
    expect(saver.state()).toBe('saved');
  });

  it('saves immediately when the page becomes hidden', async () => {
    const { api, visibility, saver, elapse } = setup();
    saver.edit({ n: '1' });
    visibility.set(true);
    await settle();
    expect(api.calls.map((call) => call.draft.answers)).toEqual([{ n: '1' }]);
    expect(saver.state()).toBe('saved');
    await elapse(5 * PAUSE);
    visibility.set(false);
    visibility.set(true);
    await settle();
    expect(api.calls).toHaveLength(1);
  });
});
