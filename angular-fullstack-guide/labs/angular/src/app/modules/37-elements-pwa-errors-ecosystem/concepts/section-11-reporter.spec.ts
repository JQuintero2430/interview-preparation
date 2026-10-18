import { ErrorHandler, InjectionToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// The reporter port and an adapter-side handler, written for this spec. The reporter is a fake: nothing is sent.
interface Report {
  readonly message: string;
  readonly version: string;
  readonly route: string;
}

interface Reporter {
  send(report: Report): void;
}

const REPORTER = new InjectionToken<Reporter>('m37 reporter');
const BUILD_VERSION = new InjectionToken<string>('m37 build version');
const CURRENT_ROUTE = new InjectionToken<() => string>('m37 current route');

const WINDOW_MS = 1000;
const EMAIL = /[A-Za-z0-9._+-]+(?:@|%40)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

function scrub(text: string): string {
  return text.replace(EMAIL, '[redacted]');
}

class ReportingErrorHandler implements ErrorHandler {
  private readonly reporter = inject(REPORTER);
  private readonly version = inject(BUILD_VERSION);
  private readonly route = inject(CURRENT_ROUTE);
  private readonly lastSent = new Map<string, number>();

  handleError(error: unknown): void {
    try {
      const message = scrub(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
      const now = Date.now();
      const previous = this.lastSent.get(message);
      if (previous !== undefined && now - previous < WINDOW_MS) {
        return;
      }
      this.lastSent.set(message, now);
      this.reporter.send({ message, version: this.version, route: scrub(this.route()) });
    } catch {
      // A failing reporter must not turn a reported error into a second error.
    }
  }
}

function setup(reporter: Reporter): ErrorHandler {
  TestBed.configureTestingModule({
    providers: [
      { provide: REPORTER, useValue: reporter },
      { provide: BUILD_VERSION, useValue: '1.4.0-lab' },
      { provide: CURRENT_ROUTE, useValue: () => '/orders/42?email=ana@example.com' },
      { provide: ErrorHandler, useClass: ReportingErrorHandler },
    ],
  });
  return TestBed.inject(ErrorHandler);
}

describe('Section 11: a reporter port behind ErrorHandler', () => {
  it('Section 11: the handler sends one report per distinct error within a window', () => {
    const sent: Report[] = [];
    const handler = setup({ send: (report) => sent.push(report) });

    vi.useFakeTimers();
    try {
      handler.handleError(new Error('boom'));
      handler.handleError(new Error('boom'));
      handler.handleError(new Error('other'));
      expect(sent.map((report) => report.message)).toEqual(['Error: boom', 'Error: other']);

      vi.advanceTimersByTime(WINDOW_MS + 1);
      handler.handleError(new Error('boom'));
      expect(sent.map((report) => report.message)).toEqual(['Error: boom', 'Error: other', 'Error: boom']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 11: a report carries the build version and route and no e-mail address', () => {
    const sent: Report[] = [];
    const handler = setup({ send: (report) => sent.push(report) });

    handler.handleError(new Error('Cannot notify ana@example.com'));

    expect(sent).toEqual([
      { message: 'Error: Cannot notify [redacted]', version: '1.4.0-lab', route: '/orders/42?email=[redacted]' },
    ]);
    expect(JSON.stringify(sent)).not.toContain('@');
  });

  it('Section 11: a failing reporter does not throw from handleError', () => {
    let calls = 0;
    const handler = setup({
      send: () => {
        calls += 1;
        throw new Error('reporter down');
      },
    });

    expect(() => handler.handleError(new Error('boom'))).not.toThrow();
    expect(calls).toBe(1);
  });
});
