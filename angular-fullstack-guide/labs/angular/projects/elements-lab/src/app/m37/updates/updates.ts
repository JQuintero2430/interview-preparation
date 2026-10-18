import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { BUILD_LABEL } from '../../build-info';

/** Reads `appData.version` from a version the worker reports (`appData` is whatever `ngsw-config.json` declared). */
function versionOf(appData: unknown): string {
  if (typeof appData === 'object' && appData !== null && 'version' in appData && typeof appData.version === 'string') {
    return appData.version;
  }
  return '?';
}

/** One line per `versionUpdates` event, with the `appData` versions it carries. */
function describe(event: VersionEvent): string {
  switch (event.type) {
    case 'VERSION_DETECTED':
      return `VERSION_DETECTED ${versionOf(event.version.appData)}`;
    case 'VERSION_READY':
      return `VERSION_READY ${versionOf(event.currentVersion.appData)} -> ${versionOf(event.latestVersion.appData)}`;
    case 'VERSION_INSTALLATION_FAILED':
      return `VERSION_INSTALLATION_FAILED ${versionOf(event.version.appData)}`;
    case 'NO_NEW_VERSION_DETECTED':
      return `NO_NEW_VERSION_DETECTED ${versionOf(event.version.appData)}`;
  }
}

/** Shows the build this tab runs, checks for an update on demand, lists every version event and offers a reload. */
@Component({
  selector: 'lab-m37-updates',
  template: `
    <h2>Updates lab</h2>
    <p data-testid="running">This tab runs {{ label }}</p>
    <button type="button" data-testid="check" (click)="check()">Check for update</button>
    <p data-testid="check-result">{{ checkResult() }}</p>
    <ol data-testid="events">
      @for (line of events(); track $index) {
        <li>{{ line }}</li>
      }
    </ol>
    @if (ready()) {
      <button type="button" (click)="reload()">Reload to update</button>
    }
    @if (unrecoverable()) {
      <p role="alert">{{ unrecoverable() }}</p>
    }
  `,
})
export class LabM37Updates {
  private readonly updates = inject(SwUpdate);
  protected readonly label = BUILD_LABEL;
  protected readonly events = signal<readonly string[]>([]);
  protected readonly checkResult = signal('not checked');
  protected readonly ready = signal(false);
  protected readonly unrecoverable = signal('');

  constructor() {
    this.updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.events.update((lines) => [...lines, describe(event)]);
      if (event.type === 'VERSION_READY') this.ready.set(true);
    });
    this.updates.unrecoverable.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.unrecoverable.set(`This page cannot continue (${event.reason}). Reload it.`);
    });
  }

  protected async check(): Promise<void> {
    try {
      this.checkResult.set(`check ${await this.updates.checkForUpdate()}`);
    } catch (error) {
      this.checkResult.set(`check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  protected reload(): void {
    document.location.reload();
  }
}
