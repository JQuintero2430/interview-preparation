import { TestBed } from '@angular/core/testing';
import {
  BehaviorSubject,
  Observable,
  defer,
  finalize,
  switchMap,
  throwError,
  timer,
  of,
} from 'rxjs';
import { Dashboard } from './dashboard';
import {
  POLL_CONFIG,
  PollConfig,
  RepeatStatusPoller,
  STATUS_SOURCE,
  StatusPoller,
} from './status-poller';
import { VISIBILITY } from './visibility';

// The text solution (`exhaustMap`) and its `repeat` alternative must pass every test below.
const POLLERS = { exhaustMap: StatusPoller, repeat: RepeatStatusPoller };

const CONFIG: PollConfig = { intervalMs: 100, backoffMs: 10, retries: 3 };

/** A fake status request: answers `s<run>` after `latencyMs`, or fails when `fails(run)`; it records what happened. */
function fakeApi(latencyMs: number, fails: (run: number) => boolean = () => false) {
  const api = {
    starts: [] as number[],
    inFlight: 0,
    maxInFlight: 0,
    delivered: 0,
    request: (): Observable<string> =>
      defer(() => {
        const run = api.starts.push(Date.now()) as number;
        api.inFlight++;
        api.maxInFlight = Math.max(api.maxInFlight, api.inFlight);
        return timer(latencyMs).pipe(
          switchMap(() => {
            if (fails(run)) {
              return throwError(() => new Error('status failed'));
            }
            api.delivered++;
            return of(`s${run}`);
          }),
          finalize(() => api.inFlight--),
        );
      }),
  };
  return api;
}

/** Mounts the dashboard over a fake request, a hand-driven visibility source and the given poller class and config. */
function mount(
  poller: typeof StatusPoller,
  api: ReturnType<typeof fakeApi>,
  config: PollConfig = CONFIG,
) {
  const visible$ = new BehaviorSubject(true);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: STATUS_SOURCE, useValue: api.request },
      { provide: VISIBILITY, useValue: visible$ },
      { provide: POLL_CONFIG, useValue: config },
    ],
  });
  TestBed.overrideComponent(Dashboard, {
    set: { providers: [{ provide: StatusPoller, useClass: poller }] },
  });
  const fixture = TestBed.createComponent(Dashboard);
  fixture.detectChanges();
  const texts = () =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('p')).map((p) => p.textContent);
  const advance = (ms: number) => {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  };
  return { fixture, visible$, texts, advance };
}

describe('E23.6 polling dashboard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('a new poll never starts while a request is in flight', () => {
    for (const poller of Object.values(POLLERS)) {
      const api = fakeApi(250);
      const { fixture, advance } = mount(poller, api);
      advance(1000);
      expect(api.maxInFlight).toBe(1);
      expect(api.delivered).toBe(3);
      expect(api.starts.length - api.delivered).toBeLessThanOrEqual(1);
      fixture.destroy();
    }
  });

  it('polling stops while the visibility source is false and restarts at once when it becomes true', () => {
    for (const poller of Object.values(POLLERS)) {
      const api = fakeApi(10);
      const { fixture, visible$, advance } = mount(poller, api);
      advance(5);
      expect(api.inFlight).toBe(1);
      visible$.next(false);
      expect(api.inFlight).toBe(0);
      expect(api.delivered).toBe(0);
      advance(1000);
      expect(api.starts).toHaveLength(1);
      expect(vi.getTimerCount()).toBe(0);
      visible$.next(true);
      advance(0);
      expect(api.starts).toHaveLength(2);
      fixture.destroy();
    }
  });

  it('a failed poll is retried with backoff and the polling continues after a success', () => {
    for (const poller of Object.values(POLLERS)) {
      // Runs 1 and 2 fail after 5 ms; the waits are 10 and 20 ms, so run 3 starts at 5 + 10 + 5 + 20 = 40 ms.
      const api = fakeApi(5, (run) => run < 3);
      const { fixture, texts, advance } = mount(poller, api);
      const start = Date.now();
      advance(44);
      expect(api.starts.map((t) => t - start)).toEqual([0, 15, 40]);
      expect(texts()).toEqual(['', '']);
      advance(1);
      expect(texts()).toEqual(['s3', 's3']);
      advance(155);
      expect(api.starts.length).toBeGreaterThan(3);
      expect(texts()).toEqual(['s4', 's4']);
      fixture.destroy();
    }
  });

  it('two widgets share one poller (one request per poll), and the poller stops when both widgets are gone', () => {
    for (const poller of Object.values(POLLERS)) {
      const api = fakeApi(10);
      const { fixture, visible$, advance } = mount(poller, api);
      advance(250);
      expect(api.starts).toHaveLength(3);
      expect(fixture.nativeElement.querySelectorAll('p')).toHaveLength(2);
      fixture.componentInstance.showFirst.set(false);
      advance(100);
      expect(api.starts.length).toBeGreaterThan(3);
      fixture.componentInstance.showSecond.set(false);
      fixture.detectChanges();
      const stopped = api.starts.length;
      advance(1000);
      expect(api.starts).toHaveLength(stopped);
      expect(visible$.observed).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      fixture.destroy();
    }
  });

  it('destroying the dashboard leaves no live subscription and no pending timer', () => {
    for (const poller of Object.values(POLLERS)) {
      const api = fakeApi(10);
      const { fixture, visible$, advance } = mount(poller, api);
      advance(5);
      expect(api.inFlight).toBe(1);
      expect(visible$.observed).toBe(true);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      fixture.destroy();
      expect(api.inFlight).toBe(0);
      expect(visible$.observed).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    }
  });

  it('the polling interval and backoff come from constants that the spec overrides', () => {
    for (const poller of Object.values(POLLERS)) {
      // Run 1 fails after 10 ms and its one retry waits 50 ms; later polls are 400 ms apart.
      const api = fakeApi(10, (run) => run === 1);
      const { fixture, advance } = mount(poller, api, {
        intervalMs: 400,
        backoffMs: 50,
        retries: 1,
      });
      const start = Date.now();
      advance(300);
      expect(api.starts.map((t) => t - start)).toEqual([0, 60]);
      advance(700);
      expect(api.starts).toHaveLength(4);
      fixture.destroy();
    }
  });
});
