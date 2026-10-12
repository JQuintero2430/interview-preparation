import { computed, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, Router } from '@angular/router';

/** How the last navigation ended: `cancel:<code>` carries the `NavigationCancellationCode` value. */
export type LabM24Outcome = 'end' | 'error' | 'skipped' | `cancel:${string}`;

/** Tells a progress bar, and anything else, whether a navigation runs and how the last one ended. */
@Injectable({ providedIn: 'root' })
export class LabM24NavigationStatus {
  private readonly router = inject(Router);

  readonly busy = computed(() => this.router.currentNavigation() !== null);
  readonly lastOutcome = signal<LabM24Outcome | null>(null);
  /** The URLs of the navigations that ended with `NavigationEnd`, oldest first. */
  readonly history = signal<readonly string[]>([]);

  constructor() {
    // `takeUntilDestroyed()` unsubscribes when the service's injector is destroyed.
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.lastOutcome.set('end');
        this.history.update((urls) => [...urls, event.urlAfterRedirects]);
      } else if (event instanceof NavigationCancel) {
        this.lastOutcome.set(`cancel:${event.code}`);
      } else if (event instanceof NavigationError) {
        this.lastOutcome.set('error');
      } else if (event instanceof NavigationSkipped) {
        this.lastOutcome.set('skipped');
      }
    });
  }

  /** Cancels the running navigation with code `Aborted`; does nothing when none runs or activation has begun. */
  abort(): void {
    this.router.currentNavigation()?.abort();
  }
}
