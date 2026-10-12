// Each test reproduces one "Output" question from Module 22 and asserts the exact lines the answer prints.
// Every test pushes into the recorder where the answer's snippet calls console.log.
// If RxJS changes behaviour, this file fails first.
import {
  AsyncSubject,
  BehaviorSubject,
  MonoTypeOperatorFunction,
  Observable,
  ReplaySubject,
  Subject,
  auditTime,
  combineLatest,
  concat,
  config,
  debounceTime,
  defer,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  first,
  forkJoin,
  from,
  fromEvent,
  interval,
  last,
  merge,
  of,
  reduce,
  scan,
  sampleTime,
  share,
  single,
  startWith,
  take,
  tap,
  throttleTime,
  throwError,
  withLatestFrom,
  zip,
} from 'rxjs';
import { timeline } from '../concepts/support/timeline';

// Q22.21: tapFirst built from existing operators; `defer` gives every subscription its own `seen`.
const tapFirst =
  <T>(fn: (value: T) => void): MonoTypeOperatorFunction<T> =>
  (source) =>
    defer(() => {
      let seen = false;
      return source.pipe(
        tap((value) => {
          if (!seen) {
            seen = true;
            fn(value);
          }
        }),
      );
    });

// Q22.22: one operator with both mistakes, and the same operator fixed.
function numberedBuggy(): MonoTypeOperatorFunction<string> {
  let count = 0;
  return (source) =>
    new Observable<string>((subscriber) => {
      source.subscribe({
        next: (value) => subscriber.next(`${++count}:${value}`),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
}

function numberedFixed(): MonoTypeOperatorFunction<string> {
  return (source) =>
    new Observable<string>((subscriber) => {
      let count = 0;
      return source.subscribe({
        next: (value) => subscriber.next(`${++count}:${value}`),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
}

// Q22.18: a store that exposes its BehaviorSubject, as the question's snippet does.
class LabM22Store {
  readonly cart = new BehaviorSubject<number>(0);

  add(amount: number): void {
    this.cart.next(this.cart.getValue() + amount);
  }
}

const lines: string[] = [];
const log = (line: string): number => lines.push(line);

beforeEach(() => {
  lines.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
  config.onUnhandledError = null;
});

describe('Module 22 Output questions', () => {
  it('Q22.02 each subscribe runs the producer to its end before it returns, and each unsubscribe runs its own teardown', () => {
    const source = new Observable<number>((subscriber) => {
      log('producer');
      subscriber.next(1);
      return () => log('teardown');
    });
    log('created');
    const a = source.subscribe((value) => log(`a:${value}`));
    log('after a');
    const b = source.subscribe((value) => log(`b:${value}`));
    a.unsubscribe();
    log('after unsubscribe a');
    b.unsubscribe();

    expect(lines).toEqual([
      'created',
      'producer',
      'a:1',
      'after a',
      'producer',
      'b:1',
      'teardown',
      'after unsubscribe a',
      'teardown',
    ]);
  });

  it('Q22.03 a promise runs its executor at creation and an observable its producer at subscribe', async () => {
    const promise = new Promise<string>((resolve) => {
      log('promise executor');
      resolve('p');
    });
    const observable = new Observable<string>((subscriber) => {
      log('observable producer');
      subscriber.next('o');
      subscriber.complete();
    });
    log('both created');
    observable.subscribe((value) => log(`${value} next`));
    await promise
      .then((value) => log(`${value} then`))
      .then(() => log('p then 2'));

    expect(lines).toEqual([
      'promise executor',
      'both created',
      'observable producer',
      'o next',
      'p then',
      'p then 2',
    ]);
  });

  it('Q22.06 a synchronous complete runs the teardown after the producer returns, and later notifications and unsubscribes do nothing', () => {
    const source = new Observable<string>((subscriber) => {
      subscriber.next('n1');
      subscriber.complete();
      subscriber.next('n2');
      subscriber.complete();
      log('producer returns');
      return () => log('teardown');
    });
    const sub = source.subscribe({
      next: (value) => log(value),
      complete: () => log('c'),
    });
    log(`closed ${sub.closed}`);
    sub.unsubscribe();
    sub.unsubscribe();
    log('after unsubscribes');

    expect(lines).toEqual(['n1', 'c', 'producer returns', 'teardown', 'closed true', 'after unsubscribes']);
  });

  it('Q22.07 the interval stays scheduled and removeEventListener gets no matching function until the teardown is returned with the kept id and handler', () => {
    vi.useFakeTimers();
    const button = document.createElement('button');
    const added = vi.spyOn(button, 'addEventListener');
    const removed = vi.spyOn(button, 'removeEventListener');

    // The three mistakes: the interval id is dropped, the teardown is an unused expression, and its removal passes a new arrow.
    const buggy = new Observable<string>((subscriber) => {
      setInterval(() => subscriber.next('tick'), 1000);
      button.addEventListener('click', () => subscriber.next('click'));
      () => button.removeEventListener('click', () => subscriber.next('click'));
    });
    buggy.subscribe().unsubscribe();

    expect(vi.getTimerCount()).toBe(1);
    expect(removed).not.toHaveBeenCalled();

    // The teardown is returned, but removes a new arrow, not the function that was added.
    vi.clearAllTimers();
    added.mockClear();
    const mismatched = new Observable<string>((subscriber) => {
      button.addEventListener('click', () => subscriber.next('click'));
      return () => button.removeEventListener('click', () => subscriber.next('click'));
    });
    mismatched.subscribe().unsubscribe();

    expect(removed).toHaveBeenCalledTimes(1);
    expect(removed.mock.calls[0][1]).not.toBe(added.mock.calls[0][1]);

    // The fix: keep the id and the function, and return the teardown.
    vi.clearAllTimers();
    added.mockClear();
    removed.mockClear();
    const fixed = new Observable<string>((subscriber) => {
      const id = setInterval(() => subscriber.next('tick'), 1000);
      const onClick = () => subscriber.next('click');
      button.addEventListener('click', onClick);
      return () => {
        clearInterval(id);
        button.removeEventListener('click', onClick);
      };
    });
    fixed.subscribe().unsubscribe();

    expect(vi.getTimerCount()).toBe(0);
    expect(removed).toHaveBeenCalledTimes(1);
    expect(removed.mock.calls[0][1]).toBe(added.mock.calls[0][1]);
  });

  it('Q22.08 a throw in a next handler and an error with no handler reach onUnhandledError on a later job', () => {
    vi.useFakeTimers();
    config.onUnhandledError = (err) => log((err as Error).message);

    throwError(() => new Error('no error handler')).subscribe();
    of(1).subscribe(() => {
      throw new Error('handler threw');
    });
    log('subscribed');
    vi.runAllTimers();
    log('timers ran');

    expect(lines).toEqual(['subscribed', 'no error handler', 'handler threw', 'timers ran']);
  });

  it('Q22.11 interval and fromEvent run a producer per subscriber and miss what came before, from(promise) runs once and defer per subscriber', async () => {
    vi.useFakeTimers();
    const button = document.createElement('button');
    const add = vi.spyOn(button, 'addEventListener');
    const remove = vi.spyOn(button, 'removeEventListener');

    const ticks = interval(10);
    const a = ticks.subscribe((n) => log(`tick a:${n}`));
    vi.advanceTimersByTime(20);
    const b = ticks.subscribe((n) => log(`tick b:${n}`));
    vi.advanceTimersByTime(20);
    a.unsubscribe();
    b.unsubscribe();

    const clicks = fromEvent(button, 'click');
    button.click();
    const s1 = clicks.subscribe(() => log('click s1'));
    const s2 = clicks.subscribe(() => log('click s2'));
    button.click();
    s1.unsubscribe();
    button.click();
    s2.unsubscribe();
    log(`listeners added ${add.mock.calls.length}, removed ${remove.mock.calls.length}`);

    let runs = 0;
    const make = (): Promise<number> => Promise.resolve(++runs);
    const eager = from(make());
    eager.subscribe((v) => log(`from a${v}`));
    eager.subscribe((v) => log(`from b${v}`));
    const lazy = defer(() => from(make()));
    lazy.subscribe((v) => log(`defer c${v}`));
    lazy.subscribe((v) => log(`defer d${v}`));
    await Promise.resolve();
    log(`runs ${runs}`);

    expect(lines).toEqual([
      'tick a:0',
      'tick a:1',
      'tick a:2',
      'tick b:0',
      'tick a:3',
      'tick b:1',
      'click s1',
      'click s2',
      'click s2',
      'listeners added 2, removed 2',
      'from a1',
      'from b1',
      'defer c2',
      'defer d3',
      'runs 3',
    ]);
  });

  it('Q22.12 share runs one producer, a synchronous first value reaches only the first subscriber, and the producer restarts after the last one leaves', () => {
    let runs = 0;
    const source = new Observable<string>((subscriber) => {
      runs++;
      log(`producer ${runs}`);
      subscriber.next('x');
      return () => log(`teardown ${runs}`);
    });
    const shared = source.pipe(share());
    const a = shared.subscribe((value) => log(`1:${value}`));
    const b = shared.subscribe((value) => log(`2:${value}`));
    a.unsubscribe();
    log('1 left');
    b.unsubscribe();
    const c = shared.subscribe((value) => log(`3:${value}`));
    log(`runs=${runs}`);
    c.unsubscribe();

    expect(lines).toEqual([
      'producer 1',
      '1:x',
      '1 left',
      'teardown 1',
      'producer 2',
      '3:x',
      'runs=2',
      'teardown 2',
    ]);
  });

  it('Q22.16 a late subscriber gets nothing, the current value, the buffer or the last value, before and after complete', () => {
    function run(name: string, subject: Subject<number>): void {
      const record = (tag: string) => ({
        next: (v: number) => log(`${name} ${tag}:${v}`),
        complete: () => log(`${name} ${tag} complete`),
      });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.subscribe(record('late'));
      subject.next(4);
      subject.complete();
      subject.subscribe(record('after-complete'));
    }
    run('Subject', new Subject<number>());
    run('Behavior', new BehaviorSubject(0));
    run('Replay(2)', new ReplaySubject<number>(2));
    run('Async', new AsyncSubject<number>());

    expect(lines).toEqual([
      'Subject late:4',
      'Subject late complete',
      'Subject after-complete complete',
      'Behavior late:3',
      'Behavior late:4',
      'Behavior late complete',
      'Behavior after-complete complete',
      'Replay(2) late:2',
      'Replay(2) late:3',
      'Replay(2) late:4',
      'Replay(2) late complete',
      'Replay(2) after-complete:3',
      'Replay(2) after-complete:4',
      'Replay(2) after-complete complete',
      'Async late:4',
      'Async late complete',
      'Async after-complete:4',
      'Async after-complete complete',
    ]);
  });

  it('Q22.17 a nested next is delivered depth first, next after complete is ignored and next after unsubscribe throws', () => {
    const subject = new Subject<number>();
    subject.subscribe((v) => {
      log(`A${v}`);
      if (v === 1) {
        subject.next(2);
      }
    });
    subject.subscribe((v) => log(`B${v}`));
    subject.next(1);
    subject.complete();
    subject.next(3);
    log(`closed ${subject.closed}`);
    subject.unsubscribe();
    try {
      subject.next(4);
    } catch (err) {
      log(`${(err as Error).name}: ${(err as Error).message}`);
    }

    expect(lines).toEqual(['A1', 'A2', 'B2', 'B1', 'closed false', 'ObjectUnsubscribedError: object unsubscribed']);
  });

  it('Q22.18 an exposed BehaviorSubject lets a consumer set the state, complete it, fail it and unsubscribe it', () => {
    const set = new LabM22Store();
    set.cart.next(-5);
    set.add(1);

    expect(set.cart.getValue()).toBe(-4);

    const completed = new LabM22Store();
    completed.cart.complete();
    completed.add(1);
    const late: string[] = [];
    completed.cart.subscribe({ next: (v) => late.push(`${v}`), complete: () => late.push('complete') });

    expect(completed.cart.getValue()).toBe(1);
    expect(late).toEqual(['complete']);

    const failed = new LabM22Store();
    const boom = new Error('boom');
    failed.cart.error(boom);

    expect(() => failed.add(1)).toThrow(boom);

    const gone = new LabM22Store();
    gone.cart.unsubscribe();

    expect(() => gone.add(1)).toThrow(expect.objectContaining({ name: 'ObjectUnsubscribedError' }));
  });

  it('Q22.21 tapFirst composed from tap forwards error and complete, runs once per subscription and unsubscribes the source', () => {
    const called: string[] = [];
    const ended: string[] = [];
    const letters = of('a', 'b').pipe(tapFirst((v) => called.push(v)));
    letters.subscribe({ next: (v) => ended.push(v), complete: () => ended.push('complete') });
    letters.subscribe();
    const failing = new Observable<string>((subscriber) => {
      subscriber.next('x');
      subscriber.error(new Error('boom'));
    }).pipe(tapFirst((v) => called.push(v)));
    failing.subscribe({ error: (err: Error) => ended.push(`error ${err.message}`) });
    let teardowns = 0;
    const held = new Observable<string>(() => () => teardowns++).pipe(tapFirst(() => undefined));
    held.subscribe().unsubscribe();

    expect(called).toEqual(['a', 'a', 'x']);
    expect(ended).toEqual(['a', 'b', 'complete', 'error boom']);
    expect(teardowns).toBe(1);
  });

  it('Q22.22 an operator that drops the upstream subscription never tears the source down, and one counter in the factory is shared', () => {
    const log: string[] = [];
    const source = new Observable<string>((subscriber) => {
      subscriber.next('a');
      return () => log.push('source teardown');
    });
    const buggy = source.pipe(numberedBuggy());
    const values: string[] = [];
    buggy.subscribe((v) => values.push(`buggy ${v}`)).unsubscribe();
    buggy.subscribe((v) => values.push(`buggy ${v}`)).unsubscribe();
    const fixed = source.pipe(numberedFixed());
    fixed.subscribe((v) => values.push(`fixed ${v}`)).unsubscribe();
    fixed.subscribe((v) => values.push(`fixed ${v}`)).unsubscribe();

    expect(values).toEqual(['buggy 1:a', 'buggy 2:a', 'fixed 1:a', 'fixed 1:a']);
    expect(log).toEqual(['source teardown', 'source teardown']);
  });

  it('Q22.24 scan emits every accumulation and reduce only the last, and only reduce with a seed emits on an empty source', () => {
    const run = (label: string, source: Observable<number>): void => {
      const seen: string[] = [];
      source.subscribe({ next: (v) => seen.push(`${v}`), complete: () => seen.push('C') });
      log(`${label}: ${seen.join(' ')}`);
    };
    const empty = from<number[]>([]);
    run('scan', of(1, 2, 3).pipe(scan((acc, v) => acc + v)));
    run('scan seed 10', of(1, 2, 3).pipe(scan((acc, v) => acc + v, 10)));
    run('reduce', of(1, 2, 3).pipe(reduce((acc, v) => acc + v)));
    run('reduce seed 10', of(1, 2, 3).pipe(reduce((acc, v) => acc + v, 10)));
    run('empty scan seed 10', empty.pipe(scan((acc, v) => acc + v, 10)));
    run('empty reduce seed 10', empty.pipe(reduce((acc, v) => acc + v, 10)));
    run('empty reduce', empty.pipe(reduce((acc, v) => acc + v)));

    expect(lines).toEqual([
      'scan: 1 3 6 C',
      'scan seed 10: 11 13 16 C',
      'reduce: 6 C',
      'reduce seed 10: 16 C',
      'empty scan seed 10: C',
      'empty reduce seed 10: 10 C',
      'empty reduce: C',
    ]);
  });

  it('Q22.25 first and last error on an empty source, take(1) completes, and single errors on two values', () => {
    const note = (source: Observable<number>): string => {
      const seen: string[] = [];
      source.subscribe({
        next: (v) => seen.push(`N${v}`),
        error: (err: Error) => seen.push(`E:${err.name}`),
        complete: () => seen.push('C'),
      });
      return seen.join(' ');
    };
    const empty = from<number[]>([]);
    const one = of(1);
    const many = of(1, 2, 3);
    log(`first: ${note(empty.pipe(first()))} | ${note(one.pipe(first()))} | ${note(many.pipe(first()))}`);
    log(`take(1): ${note(empty.pipe(take(1)))} | ${note(one.pipe(take(1)))} | ${note(many.pipe(take(1)))}`);
    log(`last: ${note(empty.pipe(last()))} | ${note(one.pipe(last()))} | ${note(many.pipe(last()))}`);
    log(`single: ${note(empty.pipe(single()))} | ${note(one.pipe(single()))} | ${note(many.pipe(single()))}`);
    log(`single(v => v === 9): ${note(many.pipe(single((v) => v === 9)))}`);

    expect(lines).toEqual([
      'first: E:EmptyError | N1 C | N1 C',
      'take(1): C | N1 C | N1 C',
      'last: E:EmptyError | N1 C | N3 C',
      'single: E:EmptyError | N1 C | E:SequenceError',
      'single(v => v === 9): E:NotFoundError',
    ]);
  });

  it('Q22.26 distinctUntilChanged drops consecutive repeats, distinct drops all repeats, and both compare objects with ===', () => {
    const show = (label: string, source: Observable<unknown>): void => {
      const seen: string[] = [];
      source.subscribe((v) => seen.push(JSON.stringify(v)));
      log(`${label}: ${seen.join(' ')}`);
    };
    const numbers = of(1, 1, 2, 2, 1);
    const objects = of({ a: 1 }, { a: 1 });
    show('distinctUntilChanged', numbers.pipe(distinctUntilChanged()));
    show('distinct', numbers.pipe(distinct()));
    show('objects distinctUntilChanged', objects.pipe(distinctUntilChanged()));
    show('objects distinct', objects.pipe(distinct()));
    show('objects comparator', objects.pipe(distinctUntilChanged((x, y) => x.a === y.a)));
    show('objects key', objects.pipe(distinctUntilKeyChanged('a')));

    expect(lines).toEqual([
      'distinctUntilChanged: 1 2 1',
      'distinct: 1 2',
      'objects distinctUntilChanged: {"a":1} {"a":1}',
      'objects distinct: {"a":1} {"a":1}',
      'objects comparator: {"a":1}',
      'objects key: {"a":1}',
    ]);
  });

  it('Q22.28 the frame of each notification of six combinators over a-b-c| and -x---y|', () => {
    const show = (label: string, entries: ReturnType<typeof timeline>): void => {
      const text = (value: unknown): string => (Array.isArray(value) ? `[${value.join(',')}]` : String(value));
      log(`${label}: ${entries.map(([frame, kind, value]) => (kind === 'C' ? `C@${frame}` : `${text(value)}@${frame}`)).join(' ')}`);
    };
    show('combineLatest', timeline(({ cold }) => combineLatest([cold('a-b-c|'), cold('-x---y|')])));
    show('withLatestFrom', timeline(({ cold }) => cold('a-b-c|').pipe(withLatestFrom(cold('-x---y|')))));
    show('zip', timeline(({ cold }) => zip(cold('a-b-c|'), cold('-x---y|'))));
    show('merge', timeline(({ cold }) => merge(cold('a-b-c|'), cold('-x---y|'))));
    show('concat', timeline(({ cold }) => concat(cold('a-b-c|'), cold('-x---y|'))));
    show('forkJoin', timeline(({ cold }) => forkJoin([cold('a-b-c|'), cold('-x---y|')])));

    expect(lines).toEqual([
      'combineLatest: [a,x]@1 [b,x]@2 [c,x]@4 [c,y]@5 C@6',
      'withLatestFrom: [b,x]@2 [c,x]@4 C@5',
      'zip: [a,x]@1 [b,y]@5 C@6',
      'merge: a@0 x@1 b@2 c@4 y@5 C@6',
      'concat: a@0 b@2 c@4 x@6 y@10 C@11',
      'forkJoin: [c,y]@6 C@6',
    ]);
  });

  it('Q22.29 a forkJoin over a source that never completes and a combineLatest over a source that has not emitted stay silent', () => {
    const silentFork = timeline(({ cold }) => forkJoin([cold('a-b|'), cold('-x-y-')]));
    const fixedFork = timeline(({ cold }) => forkJoin([cold('a-b|'), cold('-x-y-').pipe(take(1))]));
    const silentCombine = timeline(({ cold }) => combineLatest([cold('a-b|'), cold('-----')]));
    const fixedCombine = timeline(({ cold }) => combineLatest([cold('a-b|'), cold('-----').pipe(startWith('s'))]));

    expect(silentFork).toEqual([]);
    expect(fixedFork).toEqual([
      [3, 'N', ['b', 'x']],
      [3, 'C'],
    ]);
    expect(silentCombine).toEqual([]);
    expect(fixedCombine).toEqual([
      [0, 'N', ['a', 's']],
      [2, 'N', ['b', 's']],
    ]);
  });

  it('Q22.31 the four timing operators over one burst emit at different frames and meet complete differently', () => {
    const show = (label: string, entries: ReturnType<typeof timeline>): void => {
      log(`${label}: ${entries.map(([frame, kind, value]) => (kind === 'C' ? `C@${frame}` : `${String(value)}@${frame}`)).join(' ')}`);
    };
    const burst = '-a-b-c-----d-e-f|';
    show('debounceTime(3)', timeline(({ cold }) => cold(burst).pipe(debounceTime(3))));
    show('throttleTime(3)', timeline(({ cold }) => cold(burst).pipe(throttleTime(3))));
    show('auditTime(3)', timeline(({ cold }) => cold(burst).pipe(auditTime(3))));
    show('sampleTime(3)', timeline(({ cold }) => cold(burst).pipe(sampleTime(3))));

    expect(lines).toEqual([
      'debounceTime(3): c@8 f@16 C@16',
      'throttleTime(3): a@1 c@5 d@11 f@15 C@16',
      'auditTime(3): b@4 c@8 e@14 f@18 C@18',
      'sampleTime(3): b@3 c@6 d@12 f@15 C@16',
    ]);
  });
});
