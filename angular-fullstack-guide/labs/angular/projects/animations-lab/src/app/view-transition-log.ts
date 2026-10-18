import { Injectable, inject, signal } from '@angular/core';
import type { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

/** The last router view transition: where it went and whether it was skipped. */
export interface TransitionRecord {
  readonly from: string;
  readonly to: string;
  readonly skipped: boolean;
}

/** Root signal store read by the module 35 pages; only `recordTransition` writes it. */
@Injectable({ providedIn: 'root' })
export class ViewTransitionLog {
  readonly last = signal<TransitionRecord | null>(null);
}

const leaf = (snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  snapshot.firstChild ? leaf(snapshot.firstChild) : snapshot;
const pathOf = (snapshot: ActivatedRouteSnapshot): string =>
  '/' +
  leaf(snapshot)
    .pathFromRoot.flatMap((s) => s.url.map((segment) => segment.path))
    .join('/');

/**
 * `onViewTransitionCreated` callback: records the transition and skips it when the target route has
 * `data: { skipViewTransition: true }`. Runs in an injection context (the router calls it in one).
 * @param info - The router's description of the transition (`from`, `to`, `transition`).
 */
export function recordTransition(info: ViewTransitionInfo): void {
  const skipped = leaf(info.to).data['skipViewTransition'] === true;
  inject(ViewTransitionLog).last.set({ from: pathOf(info.from), to: pathOf(info.to), skipped });
  if (skipped) info.transition.skipTransition();
}
