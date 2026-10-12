import { AsyncPipe } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, EnvironmentInjector, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  NEVER,
  Observable,
  Subject,
  Subscription,
  defer,
  delay,
  finalize,
  interval,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';

const finalized: string[] = [];
let rawSubscription: Subscription | undefined;

/** A stream that never ends by itself and records its name when its subscription is finalized. */
function tracked(name: string): Observable<never> {
  return defer(() => NEVER).pipe(finalize(() => finalized.push(name)));
}

// --- One component, one stream per strategy ---

@Component({
  selector: 'lab-m23-strategies',
  imports: [AsyncPipe],
  template: `{{ viaPipe | async }}{{ viaSignal() }}`,
})
class Strategies {
  protected readonly viaPipe = tracked('async pipe');
  protected readonly viaSignal = toSignal(tracked('toSignal'));

  constructor() {
    tracked('takeUntilDestroyed').pipe(takeUntilDestroyed()).subscribe();
    rawSubscription = tracked('raw subscribe').subscribe();
  }
}

/** An inner stream that never completes and logs its subscription and teardown. */
function innerFor(log: string[]) {
  return (value: number) =>
    new Observable<string>(() => {
      log.push(`inner${value} subscribed`);
      return () => log.push(`inner${value} teardown`);
    });
}

describe('Section 6: unsubscription strategies and leaks', () => {
  beforeEach(() => {
    finalized.length = 0;
    rawSubscription = undefined;
  });

  afterEach(() => {
    rawSubscription?.unsubscribe();
    vi.useRealTimers();
  });

  it('Section 6: toSignal, takeUntilDestroyed and the async pipe end at destroy and a raw subscribe does not', () => {
    const fixture = TestBed.createComponent(Strategies);
    fixture.detectChanges();
    expect(finalized).toEqual([]);

    fixture.destroy();

    expect([...finalized].sort()).toEqual(['async pipe', 'takeUntilDestroyed', 'toSignal']);
    expect(rawSubscription?.closed).toBe(false);
  });

  it('Section 6: takeUntil before switchMap leaves the inner subscription alive', () => {
    const log: string[] = [];
    const source = new Subject<number>();
    const stop = new Subject<void>();
    source
      .pipe(takeUntil(stop), switchMap(innerFor(log)))
      .subscribe({ complete: () => log.push('complete') });
    source.next(1);
    stop.next();
    expect(log).toEqual(['inner1 subscribed']);
    expect(source.observed).toBe(false);
  });

  it('Section 6: takeUntil after switchMap tears the inner down', () => {
    const log: string[] = [];
    const source = new Subject<number>();
    const stop = new Subject<void>();
    source
      .pipe(switchMap(innerFor(log)), takeUntil(stop))
      .subscribe({ complete: () => log.push('complete') });
    source.next(1);
    stop.next();
    expect(log).toEqual(['inner1 subscribed', 'complete', 'inner1 teardown']);
    expect(source.observed).toBe(false);
  });

  it('Section 6: Subject.observed reports live subscribers', () => {
    const subject = new Subject<number>();
    expect(subject.observed).toBe(false);

    const child = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    runInInjectionContext(child, () => toSignal(subject));
    expect(subject.observed).toBe(true);

    child.destroy();
    expect(subject.observed).toBe(false);
  });

  it('Section 6: unsubscribing an interval leaves no pending timer', () => {
    vi.useFakeTimers();
    const ticking = interval(1000).subscribe();
    expect(vi.getTimerCount()).toBe(1);
    ticking.unsubscribe();
    expect(vi.getTimerCount()).toBe(0);

    const delayed = of(1).pipe(delay(100)).subscribe();
    expect(vi.getTimerCount()).toBe(1);
    delayed.unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('Section 6: HttpClient completes after one response', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const log: string[] = [];

    const subscription = http.get<string>('/config').subscribe({
      next: (body) => log.push(`next ${body}`),
      complete: () => log.push('complete'),
    });
    expect(subscription.closed).toBe(false);
    controller.expectOne('/config').flush('cfg');

    expect(log).toEqual(['next cfg', 'complete']);
    expect(subscription.closed).toBe(true);
    controller.verify();
  });
});
