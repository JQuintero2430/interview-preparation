import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { BUILD_LABEL } from '../../build-info';

/** Reads `appData.version` from a version the worker reports. */
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

/** Q37.12: the build this tab runs, a Check button and the list of `versionUpdates` events this tab received. */
@Component({
  selector: 'lab-m37-q12',
  template: `
    <h2>Version outputs lab</h2>
    <p data-testid="running">This tab runs {{ label }}</p>
    <button type="button" (click)="check()">Check for update</button>
    <p data-testid="check-result">{{ checkResult() }}</p>
    <ol data-testid="events">
      @for (line of events(); track $index) {
        <li>{{ line }}</li>
      }
    </ol>
  `,
})
export class LabM37Q12 {
  private readonly updates = inject(SwUpdate);
  protected readonly label = BUILD_LABEL;
  protected readonly events = signal<readonly string[]>([]);
  protected readonly checkResult = signal('not checked');

  constructor() {
    this.updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.events.update((lines) => [...lines, describe(event)]);
    });
  }

  protected async check(): Promise<void> {
    try {
      this.checkResult.set(`check ${await this.updates.checkForUpdate()}`);
    } catch (error) {
      this.checkResult.set(`check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
