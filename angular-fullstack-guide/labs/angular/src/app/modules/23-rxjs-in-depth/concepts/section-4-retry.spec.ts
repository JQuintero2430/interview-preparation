import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable, defer, repeat, retry, throwError, timer } from 'rxjs';
import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { TimelineEntry, timeline } from '../../22-rxjs-foundations/concepts/support/timeline';
import { legacyRepeatWhen, legacyRetryWhen } from '../legacy/deprecated-forms';

/** An HTTP-like failure: 4xx means the request itself is wrong, so retrying cannot help. */
interface Failure {
  readonly status: number;
}

const UNAVAILABLE: Failure = { status: 503 };

/**
 * Runs `pipeline` in virtual time over a source built by `defer`, so every subscription is recorded with its
 * frame, and returns the notifications (in the shape of module 22's `timeline`) and the subscription frames.
 */
function retryRun(
  marblesFor: (subscription: number) => string,
  pipeline: (source: Observable<string>) => Observable<string>,
  failure: Failure = UNAVAILABLE,
): { notifications: TimelineEntry[]; subscribedAt: number[] } {
  const subscribedAt: number[] = [];
  const notifications: TimelineEntry[] = [];
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const source = defer(() => {
      subscribedAt.push(scheduler.now());
      return cold(marblesFor(subscribedAt.length), undefined, failure);
    });
    pipeline(source).subscribe({
      next: (value) => notifications.push([scheduler.now(), 'N', value]),
      error: (err: unknown) => notifications.push([scheduler.now(), 'E', err]),
      complete: () => notifications.push([scheduler.now(), 'C']),
    });
  });
  return { notifications, subscribedAt };
}

describe('Section 4: retry and repeat', () => {
  it('Section 4: retry(2) subscribes three times and then errors', () => {
    const run = retryRun(
      () => 'a#',
      (s) => s.pipe(retry(2)),
    );
    expect(run.notifications).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'a'],
      [2, 'N', 'a'],
      [3, 'E', UNAVAILABLE],
    ]);
    expect(run.subscribedAt.length).toBe(3);
  });

  it('Section 4: retry with an exponential delay retries at frames 2, 6 and 14', () => {
    const run = retryRun(
      () => '#',
      (s) => s.pipe(retry({ count: 3, delay: (_err, retryCount) => timer(2 ** retryCount) })),
    );
    expect(run.subscribedAt).toEqual([0, 2, 6, 14]);
    expect(run.notifications).toEqual([[14, 'E', UNAVAILABLE]]);
  });

  it('Section 4: resetOnSuccess restarts the count after a value', () => {
    const failFourTimes = (n: number) => (n <= 4 ? 'a#' : 'b|');
    const plain = retryRun(failFourTimes, (s) => s.pipe(retry({ count: 2 })));
    expect(plain.notifications).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'a'],
      [2, 'N', 'a'],
      [3, 'E', UNAVAILABLE],
    ]);
    expect(plain.subscribedAt.length).toBe(3);

    const reset = retryRun(failFourTimes, (s) => s.pipe(retry({ count: 2, resetOnSuccess: true })));
    expect(reset.notifications).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'a'],
      [2, 'N', 'a'],
      [3, 'N', 'a'],
      [4, 'N', 'b'],
      [5, 'C'],
    ]);
    expect(reset.subscribedAt.length).toBe(5);
  });

  it('Section 4: a delay notifier that completes ends the stream without the error', () => {
    const run = retryRun(
      () => '#',
      (s) => s.pipe(retry({ delay: (_err, retryCount) => (retryCount === 1 ? timer(1) : EMPTY) })),
    );
    expect(run.notifications).toEqual([[1, 'C']]);
    expect(run.subscribedAt).toEqual([0, 1]);
  });

  it('Section 4: a delay function that throws gives up at once', () => {
    const isRetryable = (err: Failure) => err.status >= 500;
    const throwing = (s: Observable<string>) =>
      s.pipe(
        retry({
          count: 3,
          delay: (err: Failure) => {
            if (!isRetryable(err)) {
              throw err;
            }
            return timer(1);
          },
        }),
      );
    const returning = (s: Observable<string>) =>
      s.pipe(retry({ count: 3, delay: (err: Failure) => (isRetryable(err) ? timer(1) : throwError(() => err)) }));

    for (const pipeline of [throwing, returning]) {
      const badRequest = retryRun(() => '#', pipeline, { status: 400 });
      expect(badRequest.subscribedAt).toEqual([0]);
      expect(badRequest.notifications).toEqual([[0, 'E', { status: 400 }]]);

      const unavailable = retryRun(() => '#', pipeline);
      expect(unavailable.subscribedAt).toEqual([0, 1, 2, 3]);
      expect(unavailable.notifications).toEqual([[3, 'E', UNAVAILABLE]]);
    }
  });

  it('Section 4: retry re-sends an HttpClient request', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const errors: number[] = [];

    http
      .get<string>('/r')
      .pipe(retry(2))
      .subscribe({ error: (err: HttpErrorResponse) => errors.push(err.status) });

    let requests = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      controller.expectOne('/r').flush('down', { status: 500, statusText: 'Server Error' });
      requests++;
    }
    controller.verify();
    expect(requests).toBe(3);
    expect(errors).toEqual([500]);
  });

  it('Section 4: repeat with a delay re-subscribes after each complete and an error stops it', () => {
    expect(timeline(({ cold }) => cold('-a|').pipe(repeat(3)))).toEqual([
      [1, 'N', 'a'],
      [3, 'N', 'a'],
      [5, 'N', 'a'],
      [6, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('-a|').pipe(repeat({ count: 3, delay: 4 })))).toEqual([
      [1, 'N', 'a'],
      [7, 'N', 'a'],
      [13, 'N', 'a'],
      [14, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('-a#', undefined, 'boom').pipe(repeat(3)))).toEqual([
      [1, 'N', 'a'],
      [2, 'E', 'boom'],
    ]);
  });

  it('Section 4: the deprecated retryWhen and repeatWhen give what retry and repeat with a delay give', () => {
    const failing = (helpers: RunHelpers) => helpers.cold('a#', undefined, 'boom');
    expect(timeline((h) => legacyRetryWhen(failing(h), 2, 3))).toEqual(
      timeline((h) => failing(h).pipe(retry({ count: 2, delay: 3 }))),
    );
    const completing = (helpers: RunHelpers) => helpers.cold('-a|');
    expect(timeline((h) => legacyRepeatWhen(completing(h), 3, 4))).toEqual(
      timeline((h) => completing(h).pipe(repeat({ count: 3, delay: 4 }))),
    );
  });
});
