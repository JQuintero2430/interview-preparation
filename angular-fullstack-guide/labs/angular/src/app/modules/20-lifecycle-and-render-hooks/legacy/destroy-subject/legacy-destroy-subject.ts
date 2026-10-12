import { Component, OnDestroy, OnInit, input } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

/**
 * Legacy teardown: a `Subject` that signals the end of the component, `takeUntil` on every stream,
 * and `ngOnDestroy` to fire it. `takeUntilDestroyed` replaces all three pieces.
 */
@Component({ selector: 'lab-m20-legacy-destroy-subject', template: `{{ received.length }}` })
export class LegacyDestroySubject implements OnInit, OnDestroy {
  readonly source = input.required<Observable<number>>();
  readonly received: number[] = [];
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.source()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.received.push(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
