import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter, map, tap } from 'rxjs';
import { REPORTER } from '../../../../../../../src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/reporter';
import { BUILD_LABEL } from '../../../build-info';
import { RELOAD, connectivity, installationFailure, isInstallationFailed, isReady, versionOf } from '../update-shell';

/** Everything the template shows, derived in one place. */
interface LabM37Ex4View {
  readonly banner: string | null;
  readonly failure: string | null;
  readonly unrecoverable: string | null;
  readonly offline: boolean;
}

/**
 * Variant b: each stream becomes a signal with `toSignal` (which unsubscribes when the component is destroyed),
 * and one `computed` turns them into view state. Same page, same texts as variant a.
 */
@Component({
  selector: 'lab-m37-ex4-update-banner-b',
  template: `
    <h2>Update-aware shell (variant b)</h2>
    <p data-testid="running">This tab runs {{ label }}</p>
    <button type="button" data-testid="check" (click)="check()">Check for update</button>
    <div role="status" aria-label="Update">
      @if (view().banner; as banner) {
        <p>{{ banner }}</p>
        <button type="button" (click)="reload()">Reload</button>
      }
      @if (view().failure; as failure) {
        <p>{{ failure }}</p>
      }
    </div>
    @if (view().unrecoverable; as notice) {
      <div role="alert">
        <p>{{ notice }}</p>
        <button type="button" (click)="reload()">Reload page</button>
      </div>
    }
    <div role="status" aria-label="Connection">
      @if (view().offline) {
        <p>You are offline</p>
      }
    </div>
  `,
})
export class LabM37Ex4UpdateBannerB {
  private readonly updates = inject(SwUpdate);
  private readonly reporter = inject(REPORTER);
  private readonly reloadPage = inject(RELOAD);
  protected readonly label = BUILD_LABEL;

  private readonly readyVersion = toSignal(
    this.updates.versionUpdates.pipe(
      filter(isReady),
      map((event) => versionOf(event.latestVersion.appData)),
    ),
    { initialValue: null },
  );
  // Reporting sits in `tap`, not in an `effect`: `toSignal` subscribes at once, so every failure is reported once,
  // while an effect would only see the latest value and could miss two failures that arrive before it runs.
  private readonly failedVersion = toSignal(
    this.updates.versionUpdates.pipe(
      filter(isInstallationFailed),
      tap((event) => this.reporter.report(installationFailure(event))),
      map((event) => versionOf(event.version.appData)),
    ),
    { initialValue: null },
  );
  private readonly unrecoverableReason = toSignal(this.updates.unrecoverable.pipe(map((event) => event.reason)), { initialValue: null });
  private readonly online = toSignal(connectivity(), { initialValue: navigator.onLine });

  protected readonly view = computed<LabM37Ex4View>(() => {
    const ready = this.readyVersion();
    const failed = this.failedVersion();
    const reason = this.unrecoverableReason();
    return {
      banner: ready === null ? null : `Version ${ready} is ready`,
      failure: failed === null ? null : `Version ${failed} could not be installed. This tab keeps running ${this.label}.`,
      unrecoverable: reason === null ? null : `This page cannot continue (${reason}). Reload it to get a working version.`,
      offline: !this.online(),
    };
  });

  /** Test hook (the §6 pattern): asks the worker for an update now instead of waiting for its idle timer. */
  protected async check(): Promise<void> {
    try {
      await this.updates.checkForUpdate();
    } catch {
      // The outcome reaches this page through `versionUpdates`; a rejected check (worker off, network down) leaves the page as it is.
    }
  }

  protected reload(): void {
    this.reloadPage();
  }
}
