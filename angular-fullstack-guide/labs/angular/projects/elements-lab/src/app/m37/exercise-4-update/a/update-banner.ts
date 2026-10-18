import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { REPORTER } from '../../../../../../../src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/reporter';
import { BUILD_LABEL } from '../../../build-info';
import { RELOAD, connectivity, installationFailure, isInstallationFailed, isReady, versionOf } from '../update-shell';

/**
 * Variant a: one RxJS subscription per stream, each ended by `takeUntilDestroyed`, writing into signals the template reads.
 * Shows the build this tab runs, a banner when a new version is ready, a notice when one failed (and reports it),
 * an alert when the worker can no longer serve this tab, and an offline indicator.
 */
@Component({
  selector: 'lab-m37-ex4-update-banner-a',
  template: `
    <h2>Update-aware shell (variant a)</h2>
    <p data-testid="running">This tab runs {{ label }}</p>
    <button type="button" data-testid="check" (click)="check()">Check for update</button>
    <div role="status" aria-label="Update">
      @if (readyVersion(); as version) {
        <p>Version {{ version }} is ready</p>
        <button type="button" (click)="reload()">Reload</button>
      }
      @if (failedVersion(); as version) {
        <p>Version {{ version }} could not be installed. This tab keeps running {{ label }}.</p>
      }
    </div>
    @if (unrecoverableReason(); as reason) {
      <div role="alert">
        <p>This page cannot continue ({{ reason }}). Reload it to get a working version.</p>
        <button type="button" (click)="reload()">Reload page</button>
      </div>
    }
    <div role="status" aria-label="Connection">
      @if (!online()) {
        <p>You are offline</p>
      }
    </div>
  `,
})
export class LabM37Ex4UpdateBannerA {
  private readonly updates = inject(SwUpdate);
  private readonly reporter = inject(REPORTER);
  private readonly reloadPage = inject(RELOAD);
  protected readonly label = BUILD_LABEL;
  protected readonly readyVersion = signal<string | null>(null);
  protected readonly failedVersion = signal<string | null>(null);
  protected readonly unrecoverableReason = signal<string | null>(null);
  protected readonly online = signal(navigator.onLine);

  constructor() {
    this.updates.versionUpdates.pipe(filter(isReady), takeUntilDestroyed()).subscribe((event) => {
      this.readyVersion.set(versionOf(event.latestVersion.appData));
    });
    this.updates.versionUpdates.pipe(filter(isInstallationFailed), takeUntilDestroyed()).subscribe((event) => {
      this.failedVersion.set(versionOf(event.version.appData));
      this.reporter.report(installationFailure(event));
    });
    this.updates.unrecoverable.pipe(takeUntilDestroyed()).subscribe((event) => this.unrecoverableReason.set(event.reason));
    connectivity()
      .pipe(takeUntilDestroyed())
      .subscribe((online) => this.online.set(online));
  }

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
