import { ErrorHandler, InjectionToken, inject, type ErrorDetails } from '@angular/core';
import { widgetName } from './widgets';

const REDACTED = '[redacted]';
const EMAIL = /[A-Za-z0-9._+-]+(?:@|%40)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

/** Removes e-mail addresses (also URL-encoded as %40); mirrors the e-mail rule of labs/ts-js .../37-elements-pwa-errors-ecosystem/scrub.ts. */
function scrub(text: string): string {
  return text.replace(EMAIL, REDACTED);
}

/** What the reporter receives: one normalized, scrubbed error. */
export interface ErrorReport {
  readonly message: string;
  readonly widget: string;
  readonly buildVersion: string;
}

/** The port behind which a real tracking service would sit. */
export interface Reporter {
  report(entry: ErrorReport): void;
}

export const REPORTER = new InjectionToken<Reporter>('m37 ex3 error reporter');
export const BUILD_VERSION = new InjectionToken<string>('m37 ex3 build version');

/** Two reports with the same message and widget inside this window count as one. */
export const DEDUPE_WINDOW_MS = 5000;

const UNKNOWN_WIDGET = 'unknown';

/** A fake reporter that keeps what it receives; nothing leaves the process. */
export class RecordingReporter implements Reporter {
  readonly entries: ErrorReport[] = [];

  report(entry: ErrorReport): void {
    this.entries.push(entry);
  }
}

/**
 * Replaces Angular's default handler: normalizes the error, names the widget (looked up from `details.declarationType`,
 * since the class name is not stable in a built app), de-duplicates, scrubs and hands one entry to the reporter. It never throws.
 */
export class ReportingErrorHandler extends ErrorHandler {
  private readonly reporter = inject(REPORTER);
  private readonly buildVersion = inject(BUILD_VERSION);
  private readonly lastSent = new Map<string, number>();

  override handleError(error: unknown): void {
    this.send(error, UNKNOWN_WIDGET);
  }

  override onViewError(error: Error, details: ErrorDetails): void {
    this.send(error, widgetName(details.declarationType));
  }

  private send(error: unknown, widget: string): void {
    try {
      const message = scrub(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
      const key = `${widget}\u0000${message}`;
      const now = Date.now();
      for (const [seen, at] of this.lastSent) {
        if (now - at >= DEDUPE_WINDOW_MS) {
          this.lastSent.delete(seen);
        }
      }
      if (this.lastSent.has(key)) {
        return;
      }
      this.lastSent.set(key, now);
      this.reporter.report({ message, widget, buildVersion: this.buildVersion });
    } catch {
      // A failing reporter or an odd error value must never become a second error.
    }
  }
}
