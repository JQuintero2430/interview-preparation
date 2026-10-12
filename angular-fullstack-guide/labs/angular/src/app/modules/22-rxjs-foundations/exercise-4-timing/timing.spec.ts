import { Observable, Subject } from 'rxjs';
import { autosave, doubleClickGuard, scrollPosition, searchTerms, statusPanel } from './timing-pipelines';

/** Subscribes and returns the live list of what arrived; `complete` is recorded as the string 'complete'. */
function collect<T>(source: Observable<T>): Array<T | 'complete'> {
  const out: Array<T | 'complete'> = [];
  source.subscribe({ next: (v) => out.push(v), complete: () => out.push('complete') });
  return out;
}

/** Advances the fake clock to an absolute time, so each step reads as "at t ms". */
function clock() {
  let now = 0;
  return (t: number) => {
    vi.advanceTimersByTime(t - now);
    now = t;
  };
}

describe('E22.4 Time a search box, a scroll tracker, an autosave and a status panel', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('searchTerms emits the trimmed last term after 300 ms of silence, never twice in a row for the same term, and not at all for an empty term', () => {
    const at = clock();
    const input = new Subject<string>();
    const out = collect(searchTerms(input));

    input.next(' a');
    at(100);
    input.next(' ab ');
    at(399);
    const beforeSilence = [...out];
    at(400);
    input.next('ab  ');
    at(800);
    input.next('   ');
    at(1200);

    expect(beforeSilence).toEqual([]);
    expect(out).toEqual(['ab']);
    input.next('abc');
    at(1500);
    expect(out).toEqual(['ab', 'abc']);
  });

  it('scrollPosition emits the first position at once and the last position of a burst at the end of its window', () => {
    const at = clock();
    const position = new Subject<number>();
    const out = collect(scrollPosition(position));

    position.next(10);
    const atOnce = [...out];
    at(30);
    position.next(20);
    at(60);
    position.next(30);
    at(99);
    const beforeWindowEnds = [...out];
    at(100);
    const atWindowEnd = [...out];
    at(1000);
    position.next(50);

    expect([atOnce, beforeWindowEnds, atWindowEnd]).toEqual([[10], [10], [10, 30]]);
    expect(out).toEqual([10, 30, 50]);
  });

  it('autosave saves at most once per second, never loses the last change, and saves a pending change when the source completes', () => {
    const at = clock();
    const typing = new Subject<string>();
    const saves = collect(autosave(typing));

    const typeUntil = (from: number, to: number) => {
      for (let i = from; i <= to; i++) {
        at(i * 150);
        typing.next(`v${i}`);
      }
    };
    typeUntil(0, 6);
    at(1000);
    const afterOneSecond = [...saves];
    typeUntil(7, 13);
    at(2050);
    const afterTyping = [...saves];

    typing.next('late');
    typing.complete();
    const atComplete = [...saves];
    at(3050);

    expect(afterOneSecond).toEqual(['v6']);
    expect(afterTyping).toEqual(['v6', 'v13']);
    expect(atComplete).toEqual(['v6', 'v13']);
    expect(saves).toEqual(['v6', 'v13', 'late', 'complete']);
  });

  it('statusPanel shows the latest value every 250 ms and stays silent in a window with no new value', () => {
    const at = clock();
    const status = new Subject<string>();
    const out = collect(statusPanel(status));

    at(10);
    status.next('loading');
    at(100);
    status.next('ready');
    at(249);
    const beforeTick = [...out];
    at(500);
    const quietWindow = [...out];
    at(600);
    status.next('stale');
    at(750);

    expect([beforeTick, quietWindow]).toEqual([[], ['ready']]);
    expect(out).toEqual(['ready', 'stale']);
  });

  it('a double-click guard (throttleTime leading only) ignores a second click within 500 ms', () => {
    const at = clock();
    const clicks = new Subject<string>();
    const out = collect(doubleClickGuard(clicks));

    clicks.next('first');
    at(200);
    clicks.next('double');
    at(600);
    clicks.next('later');

    expect(out).toEqual(['first', 'later']);
  });

  it('unsubscribing cancels every pending timer (vi.getTimerCount() is 0)', () => {
    const pipelines = [searchTerms, scrollPosition, autosave, statusPanel, doubleClickGuard];
    const pending = pipelines.map((pipeline) => {
      const input = new Subject<string>();
      const subscription = (pipeline as (source: Observable<string>) => Observable<unknown>)(input).subscribe();
      input.next('x');
      input.next('y');
      return subscription;
    });
    const before = vi.getTimerCount();

    pending.forEach((subscription) => subscription.unsubscribe());

    expect(before).toBeGreaterThanOrEqual(pipelines.length);
    expect(vi.getTimerCount()).toBe(0);
  });
});
