import { Component, Injectable, Type, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
  provideRouter,
  Routes,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, throwError } from 'rxjs';
import { LabM24NavigationStatus, LabM24Outcome } from './navigation-status';
import { LabM24ProgressBar } from './progress-bar';

@Component({ selector: 'lab-m24-status-page', template: 'page' })
class LabM24StatusPage {}

/** A promise settled by hand, so a test decides when a guard answers. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

/** The alternative: `busy` is a signal set on `NavigationStart` and cleared on the four terminal events. */
@Injectable()
class LabM24EventBusyStatus {
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly lastOutcome = signal<LabM24Outcome | null>(null);
  readonly history = signal<readonly string[]>([]);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.busy.set(true);
        return;
      }
      if (event instanceof NavigationEnd) {
        this.lastOutcome.set('end');
        this.history.update((urls) => [...urls, event.urlAfterRedirects]);
      } else if (event instanceof NavigationCancel) {
        this.lastOutcome.set(`cancel:${event.code}`);
      } else if (event instanceof NavigationError) {
        this.lastOutcome.set('error');
      } else if (event instanceof NavigationSkipped) {
        this.lastOutcome.set('skipped');
      } else {
        return;
      }
      this.busy.set(false);
    });
  }

  abort(): void {
    this.router.currentNavigation()?.abort();
  }
}

/** Both solutions run every test; the progress bar reads whichever one is provided. */
const SERVICES: Type<unknown>[] = [LabM24NavigationStatus, LabM24EventBusyStatus];

const failingResolver = (): Observable<never> => throwError(() => new Error('resolver failed'));

/** Starts a fresh router and the status service, and records `lastOutcome` at every terminal event. */
async function start(routes: Routes, service: Type<unknown>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: LabM24NavigationStatus, useClass: service }],
  });
  const status = TestBed.inject(LabM24NavigationStatus);
  const router = TestBed.inject(Router);
  const harness = await RouterTestingHarness.create();
  const outcomes: (string | null)[] = [];
  router.events.subscribe((e) => {
    if (e.constructor.name.match(/^Navigation(End|Cancel|Error|Skipped)$/)) outcomes.push(status.lastOutcome());
  });
  return { status, router, harness, outcomes };
}

function slowRoute(gate: { promise: Promise<boolean> }): Routes {
  const slow: CanActivateFn = () => gate.promise;
  return [
    { path: 'a', component: LabM24StatusPage },
    { path: 'b', component: LabM24StatusPage },
    { path: 'slow', canActivate: [slow], component: LabM24StatusPage },
    { path: 'denied', canActivate: [() => false], component: LabM24StatusPage },
    { path: 'broken', resolve: { x: failingResolver }, component: LabM24StatusPage },
  ];
}

describe('E24.5 build a navigation status service', () => {
  it('`busy` is true during a navigation held by an async guard and false after it ends', async () => {
    for (const service of SERVICES) {
      const gate = deferred<boolean>();
      const { status, router } = await start(slowRoute(gate), service);
      expect(status.busy()).toBe(false);
      const result = router.navigateByUrl('/slow');
      expect(status.busy()).toBe(true);
      gate.resolve(true);
      expect(await result).toBe(true);
      expect(status.busy()).toBe(false);
    }
  });

  it('a superseded navigation records `cancel:1` and the next one `end`', async () => {
    for (const service of SERVICES) {
      const gate = deferred<boolean>();
      const { status, router, outcomes } = await start(slowRoute(gate), service);
      const results = await Promise.all([router.navigateByUrl('/slow'), router.navigateByUrl('/b')]);
      expect(results).toEqual([false, true]);
      expect(outcomes).toEqual(['cancel:1', 'end']);
      expect(status.lastOutcome()).toBe('end');
      gate.resolve(true);
    }
  });

  it('`abort()` during a slow navigation records `cancel:4` and keeps the URL', async () => {
    for (const service of SERVICES) {
      const gate = deferred<boolean>();
      const { status, router, harness } = await start(slowRoute(gate), service);
      await harness.navigateByUrl('/a');
      const result = router.navigateByUrl('/slow');
      status.abort();
      expect(await result).toBe(false);
      expect(status.lastOutcome()).toBe('cancel:4');
      expect(router.url).toBe('/a');
      gate.resolve(true);
    }
  });

  it('a guard that returns `false` records `cancel:3`, and a resolver error records `error`', async () => {
    for (const service of SERVICES) {
      const { status, router } = await start(slowRoute(deferred<boolean>()), service);
      expect(await router.navigateByUrl('/denied')).toBe(false);
      expect(status.lastOutcome()).toBe('cancel:3');
      await expect(router.navigateByUrl('/broken')).rejects.toThrow('resolver failed');
      expect(status.lastOutcome()).toBe('error');
    }
  });

  it('`history` lists only URLs that ended with `NavigationEnd`, in order', async () => {
    for (const service of SERVICES) {
      const { status, router } = await start(slowRoute(deferred<boolean>()), service);
      await router.navigateByUrl('/a');
      await router.navigateByUrl('/denied');
      await router.navigateByUrl('/b');
      await router.navigateByUrl('/b');
      expect(status.lastOutcome()).toBe('skipped');
      expect(status.history()).toEqual(['/a', '/b']);
    }
  });

  it('the progress bar renders while `busy` is true and disappears after every outcome', async () => {
    for (const service of SERVICES) {
      const gate = deferred<boolean>();
      const { router } = await start(slowRoute(gate), service);
      const fixture = TestBed.createComponent(LabM24ProgressBar);
      const bar = () => fixture.nativeElement.querySelector('[role="progressbar"]');
      fixture.detectChanges();
      expect(bar()).toBeNull();
      for (const [url, release] of [
        ['/slow', true],
        ['/denied', false],
        ['/b', false],
      ] as const) {
        const result = router.navigateByUrl(url).catch(() => false);
        if (url === '/slow') {
          fixture.detectChanges();
          expect(bar()).not.toBeNull();
          gate.resolve(release);
        }
        await result;
        fixture.detectChanges();
        expect(bar()).toBeNull();
      }
      await router.navigateByUrl('/broken').catch(() => false);
      fixture.detectChanges();
      expect(bar()).toBeNull();
    }
  });
});
