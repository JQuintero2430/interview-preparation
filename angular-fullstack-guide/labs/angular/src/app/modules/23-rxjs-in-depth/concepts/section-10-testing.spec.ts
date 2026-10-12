import {
  animationFrames,
  debounceTime,
  delay,
  from,
  interval,
  map,
  of,
  Subject,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

/** Every spec builds its own scheduler: the callback compares the actual and expected frame logs. */
function newScheduler(): TestScheduler {
  return new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
}

/** One `[value, frame]` entry per notification, read from the scheduler's clock. */
type FrameLog = Array<[string, number]>;

describe('Section 10: TestScheduler', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Section 10: marble values, completion and errors map to frames', () => {
    newScheduler().run(({ cold, expectObservable }) => {
      const upper = cold('-a-b|', { a: 'a', b: 'b' }).pipe(map((value) => value.toUpperCase()));
      expectObservable(upper).toBe('-A-B|', { A: 'A', B: 'B' });
      const failing = cold('-a-#', { a: 1 }, new Error('boom'));
      expectObservable(failing).toBe('-a-#', { a: 1 }, new Error('boom'));
    });
  });

  it('Section 10: a sync group takes the frame of its opening parenthesis', () => {
    newScheduler().run(({ expectObservable }) => {
      expectObservable(of(1, 2)).toBe('(ab|)', { a: 1, b: 2 });
    });
    const grouped = newScheduler();
    const groupedLog: FrameLog = [];
    grouped.run(({ cold, flush }) => {
      cold('(ab)-c|').subscribe({
        next: (value) => groupedLog.push([value, grouped.now()]),
        complete: () => groupedLog.push(['done', grouped.now()]),
      });
      flush();
    });
    expect(groupedLog).toEqual([
      ['a', 0],
      ['b', 0],
      ['c', 5],
      ['done', 6],
    ]);
    const single = newScheduler();
    const singleLog: FrameLog = [];
    single.run(({ cold, flush }) => {
      cold('a|').subscribe({
        next: (value) => singleLog.push([value, single.now()]),
        complete: () => singleLog.push(['done', single.now()]),
      });
      flush();
    });
    expect(singleLog).toEqual([
      ['a', 0],
      ['done', 1],
    ]);
  });

  it('Section 10: time progression with delay needs a group for the completion', () => {
    newScheduler().run(({ cold, expectObservable, time }) => {
      expectObservable(cold('a|').pipe(delay(10))).toBe('10ms (a|)');
      expectObservable(timer(5)).toBe('5ms (x|)', { x: 0 });
      expect(time('---|')).toBe(3);
    });
    expect(() =>
      newScheduler().run(({ cold, expectObservable }) => {
        expectObservable(cold('a|').pipe(delay(10))).toBe('10ms a|');
      }),
    ).toThrow();
  });

  it('Section 10: a hot source starts at its caret and subscription marbles record subscribe and unsubscribe', () => {
    newScheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const hotSource = hot('-a-^b-c|');
      expectObservable(hotSource).toBe('-b-c|');
      expectSubscriptions(hotSource.subscriptions).toBe('^---!');
      const coldSource = cold('-a-b-c|');
      expectObservable(coldSource, '---!').toBe('-a-');
      expectSubscriptions(coldSource.subscriptions).toBe('^--!');
    });
  });

  it('Section 10: expectSubscriptions shows switchMap unsubscribing its inner', () => {
    newScheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const outer = hot('a-b----|');
      const first = cold('--x|');
      const second = cold('--x|');
      const inners = [first, second];
      const result = outer.pipe(switchMap((_, index) => inners[index]));
      expectObservable(result).toBe('----x--|');
      expectSubscriptions(first.subscriptions).toBe('^-!');
      expectSubscriptions(second.subscriptions).toBe('--^--!');
    });
  });

  it('Section 10: debounceTime runs on virtual time without a scheduler argument', () => {
    vi.useFakeTimers();
    const outsideSource = new Subject<number>();
    const outside = outsideSource.pipe(debounceTime(3)).subscribe();
    outsideSource.next(1);
    expect(vi.getTimerCount()).toBe(1);
    outside.unsubscribe();
    newScheduler().run(({ cold, expectObservable }) => {
      const insideSource = new Subject<number>();
      const subscription = insideSource.pipe(debounceTime(3)).subscribe();
      insideSource.next(1);
      expect(vi.getTimerCount()).toBe(0);
      subscription.unsubscribe();
      expectObservable(cold('a-b----c|').pipe(debounceTime(3))).toBe('-----b--(c|)');
    });
  });

  it('Section 10: a Promise inside run is not virtual', async () => {
    const seen: number[] = [];
    newScheduler().run(({ expectObservable }) => {
      const source = from(Promise.resolve(1));
      expectObservable(source).toBe('');
      source.subscribe((value) => seen.push(value));
    });
    expect(seen).toEqual([]);
    await new Promise<void>((resolve) => setTimeout(resolve));
    expect(seen).toEqual([1]);
  });

  it('Section 10: frames are ten times longer outside run', () => {
    expect(TestScheduler.frameTimeFactor).toBe(10);
    const outside = newScheduler();
    const outsideLog: FrameLog = [];
    outside.createColdObservable('-a|').subscribe({
      next: (value) => outsideLog.push([value, outside.now()]),
      complete: () => outsideLog.push(['done', outside.now()]),
    });
    outside.flush();
    expect(outsideLog).toEqual([
      ['a', 10],
      ['done', 20],
    ]);
    const inside = newScheduler();
    const insideLog: FrameLog = [];
    inside.run(({ cold, flush }) => {
      expect(TestScheduler.frameTimeFactor).toBe(1);
      cold('-a|').subscribe({
        next: (value) => insideLog.push([value, inside.now()]),
        complete: () => insideLog.push(['done', inside.now()]),
      });
      flush();
    });
    expect(insideLog).toEqual([
      ['a', 1],
      ['done', 2],
    ]);
    expect(TestScheduler.frameTimeFactor).toBe(10);
  });

  it('Section 10: animate drives animationFrames', () => {
    newScheduler().run(({ animate, expectObservable }) => {
      animate('---x---x');
      const elapsed = animationFrames().pipe(
        map(({ elapsed: ms }) => ms),
        take(2),
      );
      expectObservable(elapsed).toBe('---a---(b|)', { a: 3, b: 7 });
    });
  });

  it('Section 10: an unbounded source is ended by an unsubscription marble', () => {
    newScheduler().run(({ expectObservable }) => {
      expectObservable(interval(2), '-----!').toBe('--a-b-', { a: 0, b: 1 });
    });
  });
});
