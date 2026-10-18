import { DOCUMENT, InjectionToken, inject } from '@angular/core';
import type { VersionEvent, VersionInstallationFailedEvent, VersionReadyEvent } from '@angular/service-worker';
import { fromEvent, map, merge, type Observable } from 'rxjs';
import type { ErrorReport } from '../../../../../../src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/reporter';
import { BUILD_LABEL } from '../../build-info';

/** Reloads the page. A token, so `ng test` can count reloads instead of reloading jsdom. */
export const RELOAD = new InjectionToken<() => void>('m37 ex4 reload', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return () => document.location.reload();
  },
});

/** The name the shell reports its errors under. */
export const UPDATE_WIDGET = 'update-banner';

/** Reads `appData.version` from a version the worker reports (`appData` is whatever `ngsw-config.json` declared). */
export function versionOf(appData: unknown): string {
  if (typeof appData === 'object' && appData !== null && 'version' in appData && typeof appData.version === 'string') {
    return appData.version;
  }
  return '?';
}

/** Narrows a version event to `VERSION_READY` (a new version is downloaded and waits for a reload). */
export function isReady(event: VersionEvent): event is VersionReadyEvent {
  return event.type === 'VERSION_READY';
}

/** Narrows a version event to `VERSION_INSTALLATION_FAILED` (checking for or downloading a new version failed). */
export function isInstallationFailed(event: VersionEvent): event is VersionInstallationFailedEvent {
  return event.type === 'VERSION_INSTALLATION_FAILED';
}

/** The entry the shell hands to Exercise 37.3's reporter when a new version fails to install. */
export function installationFailure(event: VersionInstallationFailedEvent): ErrorReport {
  return {
    message: `Version ${versionOf(event.version.appData)} failed to install: ${event.error}`,
    widget: UPDATE_WIDGET,
    buildVersion: BUILD_LABEL,
  };
}

/** `true` on the window's `online` event, `false` on `offline`; the browser's own signal, not a request that failed. */
export function connectivity(): Observable<boolean> {
  return merge(fromEvent(window, 'online').pipe(map(() => true)), fromEvent(window, 'offline').pipe(map(() => false)));
}
