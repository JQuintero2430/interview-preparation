import { EventEmitter } from '@angular/core';
import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, config, of } from 'rxjs';

// --- A fixture with the guide's advice applied: the Subject stays private, the outside sees an Observable ---

class LabM22Counter {
  private readonly subject = new BehaviorSubject(0);
  readonly value$: Observable<number> = this.subject.asObservable();

  increment(): void {
    this.subject.next(this.subject.getValue() + 1);
  }
}

describe('Section 4: subjects', () => {
  afterEach(() => {
    vi.useRealTimers();
    config.onUnhandledError = null;
  });

  it('Section 4: a Subject delivers only what is emitted after the subscription', () => {
    const subject = new Subject<number>();
    const early: number[] = [];
    const late: number[] = [];

    subject.next(0);
    subject.subscribe((v) => early.push(v));
    subject.next(1);
    subject.subscribe((v) => late.push(v));
    subject.next(2);

    expect(early).toEqual([1, 2]);
    expect(late).toEqual([2]);
  });

  it('Section 4: BehaviorSubject replays its current value and getValue works until an error', () => {
    const subject = new BehaviorSubject(0);
    const log: string[] = [];

    subject.subscribe((v) => log.push(`a${v}`));
    subject.next(1);
    subject.subscribe((v) => log.push(`b${v}`));

    expect(log).toEqual(['a0', 'a1', 'b1']);
    expect(subject.getValue()).toBe(1);
    expect(subject.value).toBe(1);

    subject.complete();
    const afterComplete: string[] = [];
    subject.subscribe({ next: (v) => afterComplete.push(`next ${v}`), complete: () => afterComplete.push('complete') });

    expect(afterComplete).toEqual(['complete']);
    expect(subject.getValue()).toBe(1);

    const failing = new BehaviorSubject(0);
    const boom = new Error('boom');
    failing.error(boom);

    expect(() => failing.getValue()).toThrow(boom);
  });

  it('Section 4: ReplaySubject replays its buffer and then completes late subscribers', () => {
    const subject = new ReplaySubject<number>(2);
    const late: string[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((v) => late.push(`late ${v}`));
    subject.next(4);

    expect(late).toEqual(['late 2', 'late 3', 'late 4']);

    subject.complete();
    const afterComplete: string[] = [];
    subject.subscribe({ next: (v) => afterComplete.push(`${v}`), complete: () => afterComplete.push('complete') });

    expect(afterComplete).toEqual(['3', '4', 'complete']);

    const unbounded = new ReplaySubject<number>();
    [1, 2, 3, 4, 5].forEach((v) => unbounded.next(v));
    const all: number[] = [];
    unbounded.subscribe((v) => all.push(v));

    expect(all).toEqual([1, 2, 3, 4, 5]);

    const zero = new ReplaySubject<number>(0);
    zero.next(1);
    zero.next(2);
    const kept: number[] = [];
    zero.subscribe((v) => kept.push(v));

    expect(kept).toEqual([2]);
  });

  it('Section 4: AsyncSubject emits only its last value on complete and nothing on error', () => {
    const subject = new AsyncSubject<number>();
    const log: string[] = [];

    subject.subscribe((v) => log.push(`early ${v}`));
    subject.next(1);
    subject.next(2);
    log.push('before complete');
    subject.complete();
    subject.subscribe((v) => log.push(`late ${v}`));

    expect(log).toEqual(['before complete', 'early 2', 'late 2']);

    const failing = new AsyncSubject<number>();
    const afterError: string[] = [];
    failing.next(1);
    failing.error(new Error('x'));
    failing.subscribe({ next: (v) => afterError.push(`next ${v}`), error: (e: Error) => afterError.push(`error ${e.message}`) });

    expect(afterError).toEqual(['error x']);
  });

  it('Section 4: next after complete is ignored and after unsubscribe throws ObjectUnsubscribedError', () => {
    const subject = new Subject<number>();
    const log: number[] = [];
    subject.subscribe((v) => log.push(v));

    subject.complete();
    subject.next(1);

    expect(log).toEqual([]);
    expect(subject.closed).toBe(false);
    expect(subject.observed).toBe(false);

    const unsubscribed = new BehaviorSubject(0);
    unsubscribed.subscribe();

    expect(unsubscribed.observed).toBe(true);

    unsubscribed.unsubscribe();

    expect(unsubscribed.closed).toBe(true);
    expect(() => unsubscribed.next(1)).toThrow(expect.objectContaining({ name: 'ObjectUnsubscribedError', message: 'object unsubscribed' }));
    expect(() => unsubscribed.subscribe()).toThrow(expect.objectContaining({ name: 'ObjectUnsubscribedError' }));
    expect(() => unsubscribed.getValue()).toThrow(expect.objectContaining({ name: 'ObjectUnsubscribedError' }));
  });

  it('Section 4: a nested next is delivered depth first', () => {
    const subject = new Subject<number>();
    const log: string[] = [];

    subject.subscribe((v) => {
      log.push(`A${v}`);
      if (v === 1) {
        subject.next(2);
      }
    });
    subject.subscribe((v) => log.push(`B${v}`));
    subject.next(1);

    expect(log).toEqual(['A1', 'A2', 'B2', 'B1']);
  });

  it('Section 4: a subscriber unsubscribed by a peer during delivery is not called', () => {
    const subject = new Subject<number>();
    const seen: string[] = [];
    let victim: Subscription | undefined;
    subject.subscribe(() => {
      seen.push('first');
      victim?.unsubscribe();
    });
    victim = subject.subscribe(() => seen.push('victim'));
    subject.subscribe(() => seen.push('last'));
    subject.next(1);

    expect(seen).toEqual(['first', 'last']);
    expect(victim.closed).toBe(true);
  });

  it('Section 4: a subscriber that throws does not stop the others', () => {
    vi.useFakeTimers();
    const reported: string[] = [];
    config.onUnhandledError = (err: unknown) => reported.push((err as Error).message);
    const subject = new Subject<number>();
    const log: string[] = [];

    subject.subscribe(() => {
      throw new Error('first threw');
    });
    subject.subscribe((v) => log.push(`second ${v}`));
    subject.next(1);

    expect(log).toEqual(['second 1']);
    expect(reported).toEqual([]);

    vi.runAllTimers();

    expect(reported).toEqual(['first threw']);
  });

  it('Section 4: after the end a late subscriber gets the terminal notification, with the buffer for ReplaySubject', () => {
    const late = (subject: Subject<number>): string[] => {
      const log: string[] = [];
      subject.subscribe({
        next: (v) => log.push(`${v}`),
        error: (e: Error) => log.push(`error ${e.message}`),
        complete: () => log.push('complete'),
      });
      return log;
    };
    const finish = (subject: Subject<number>, end: 'complete' | 'error'): void => {
      subject.next(1);
      subject.next(2);
      if (end === 'complete') {
        subject.complete();
      } else {
        subject.error(new Error('x'));
      }
    };
    const table: Record<string, string[][]> = {};
    const makers: Record<string, () => Subject<number>> = {
      Subject: () => new Subject<number>(),
      BehaviorSubject: () => new BehaviorSubject(0),
      ReplaySubject: () => new ReplaySubject<number>(2),
      AsyncSubject: () => new AsyncSubject<number>(),
    };
    for (const [name, make] of Object.entries(makers)) {
      const done = make();
      finish(done, 'complete');
      const failed = make();
      finish(failed, 'error');
      table[name] = [late(done), late(failed)];
    }

    expect(table).toEqual({
      Subject: [['complete'], ['error x']],
      BehaviorSubject: [['complete'], ['error x']],
      ReplaySubject: [['1', '2', 'complete'], ['1', '2', 'error x']],
      AsyncSubject: [['2', 'complete'], ['error x']],
    });
  });

  it('Section 4: asObservable hides next', () => {
    const subject = new Subject<number>();
    const view = subject.asObservable();
    const log: number[] = [];
    view.subscribe((v) => log.push(v));
    subject.next(1);

    expect(log).toEqual([1]);
    expect(view).not.toBe(subject);
    expect(view instanceof Subject).toBe(false);
    expect('next' in view).toBe(false);

    const counter = new LabM22Counter();
    const seen: number[] = [];
    counter.value$.subscribe((v) => seen.push(v));
    counter.increment();

    expect(seen).toEqual([0, 1]);
    expect('next' in counter.value$).toBe(false);
  });

  it('Section 4: a Subject is an observer, so it can subscribe to a source and multicast it', () => {
    const subject = new Subject<number>();
    const a: number[] = [];
    const b: number[] = [];
    subject.subscribe((v) => a.push(v));
    subject.subscribe((v) => b.push(v));
    of(1, 2).subscribe(subject);

    expect(a).toEqual([1, 2]);
    expect(b).toEqual([1, 2]);
    expect(subject.isStopped).toBe(true);
  });

  it('Section 4: Subject.create sends next to the destination and subscribes to the source', () => {
    const received: number[] = [];
    const destination = { next: (v: number) => received.push(v), error: () => undefined, complete: () => undefined };
    const subject = Subject.create(destination, of(7, 8)) as Subject<number>;
    const out: number[] = [];

    subject.subscribe((v) => out.push(v));
    subject.next(1);

    expect(out).toEqual([7, 8]);
    expect(received).toEqual([1]);
  });

  it('Section 4: EventEmitter extends Subject', () => {
    const emitter = new EventEmitter<number>();
    const log: number[] = [];
    emitter.subscribe((v) => log.push(v));

    emitter.emit(1);
    emitter.next(2);

    expect(log).toEqual([1, 2]);
    expect(emitter instanceof Subject).toBe(true);
  });
});
