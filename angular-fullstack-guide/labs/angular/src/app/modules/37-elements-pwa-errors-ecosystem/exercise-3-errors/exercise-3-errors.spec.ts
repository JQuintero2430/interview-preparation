import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler, type Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { LabM37Ex3ADashboard } from './a/dashboard';
import { LabM37Ex3BDashboard } from './b/dashboard';
import { BUILD_VERSION, DEDUPE_WINDOW_MS, REPORTER, RecordingReporter, ReportingErrorHandler } from './reporter';
import { LabM37Ex3Data, PROFILE_URL } from './widgets';

const VERSION = '1.4.0-lab';

const dashboards: Record<'a' | 'b', Type<unknown>> = {
  a: LabM37Ex3ADashboard,
  b: LabM37Ex3BDashboard,
};
const variantNames: ReadonlyArray<'a' | 'b'> = ['a', 'b'];

interface Rig {
  readonly fixture: ComponentFixture<unknown>;
  readonly host: HTMLElement;
  readonly reporter: RecordingReporter;
  readonly http: HttpTestingController;
  readonly data: LabM37Ex3Data;
}

/** Renders a dashboard and answers the profile request with a 404, the expected "no profile" answer. */
function render(dashboard: Type<unknown>): Rig {
  const reporter = new RecordingReporter();
  TestBed.configureTestingModule({
    rethrowApplicationErrors: false,
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: REPORTER, useValue: reporter },
      { provide: BUILD_VERSION, useValue: VERSION },
      { provide: ErrorHandler, useClass: ReportingErrorHandler },
    ],
  });
  const fixture = TestBed.createComponent(dashboard);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne(PROFILE_URL).flush('missing', { status: 404, statusText: 'Not Found' });
  fixture.detectChanges();
  const host: HTMLElement = fixture.nativeElement;
  return { fixture, host, reporter, http, data: TestBed.inject(LabM37Ex3Data) };
}

function widget(host: HTMLElement, name: string): HTMLElement {
  const found = host.querySelector<HTMLElement>(`[data-widget="${name}"]`);
  if (found === null) {
    throw new Error(`no widget section ${name}`);
  }
  return found;
}

function textOf(element: Element | null): string | null {
  return element?.textContent?.trim() ?? null;
}

function pressRetry(host: HTMLElement, name: string): void {
  widget(host, name).querySelector('button')?.click();
}

describe.each(variantNames)('Exercise 37.3: error pipeline, variant %s', (variant) => {
  const dashboard = dashboards[variant];

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a fallback in place of a widget that throws while rendering', async () => {
    const { fixture, host, data, http } = render(dashboard);
    expect(textOf(widget(host, 'chart').querySelector('.m37-chart'))).toBe('Total: 6');

    data.chartValues.set([1, -2]);
    await fixture.whenStable();

    const chart = widget(host, 'chart');
    expect(textOf(chart.querySelector('[role="alert"]'))).toBe('Chart is unavailable.');
    expect(chart.querySelector('.m37-chart')).toBeNull();
    expect(host.querySelector('lab-m37-ex3-chart')).toBeNull();
    http.verify();
  });

  it('keeps the other widgets rendered when one fails', async () => {
    const { fixture, host, data, http } = render(dashboard);

    data.chartValues.set([-1]);
    await fixture.whenStable();

    const items = Array.from(widget(host, 'list').querySelectorAll('li'), (li) => textOf(li));
    expect(items).toEqual(['Ada', 'Grace', 'Linus']);
    expect(textOf(widget(host, 'profile').querySelector('.m37-profile'))).toBe('No profile yet');
    expect(host.querySelectorAll('[role="alert"]')).toHaveLength(1);
    http.verify();
  });

  it('re-creates the widget when the user presses Retry after the data is fixed', async () => {
    const { fixture, host, data, http } = render(dashboard);
    data.chartValues.set([-1]);
    await fixture.whenStable();
    expect(textOf(widget(host, 'chart').querySelector('[role="alert"]'))).toBe('Chart is unavailable.');

    // Fixing the data alone does not bring the widget back; the user has to ask for it.
    data.chartValues.set([4, 5]);
    await fixture.whenStable();
    expect(widget(host, 'chart').querySelector('.m37-chart')).toBeNull();

    pressRetry(host, 'chart');
    await fixture.whenStable();

    const chart = widget(host, 'chart');
    expect(textOf(chart.querySelector('.m37-chart'))).toBe('Total: 9');
    expect(chart.querySelector('[role="alert"]')).toBeNull();
    http.verify();
  });

  it('reports each distinct error once with the widget name and build version', () => {
    vi.useFakeTimers();
    const { fixture, host, data, reporter, http } = render(dashboard);

    data.chartValues.set([1, -2]);
    fixture.detectChanges();
    expect(reporter.entries).toEqual([
      { message: 'Error: Bad chart data', widget: 'chart', buildVersion: VERSION },
    ]);

    // The same error again inside the window (Retry while the data is still bad) is not reported twice.
    pressRetry(host, 'chart');
    fixture.detectChanges();
    expect(reporter.entries).toHaveLength(1);

    // A different error is a different report.
    data.chartValues.set([]);
    pressRetry(host, 'chart');
    fixture.detectChanges();
    expect(reporter.entries.map((entry) => entry.message)).toEqual(['Error: Bad chart data', 'Error: Chart data is empty']);

    // After the window the same error counts as new.
    vi.advanceTimersByTime(DEDUPE_WINDOW_MS + 1);
    pressRetry(host, 'chart');
    fixture.detectChanges();
    expect(reporter.entries.map((entry) => entry.message)).toEqual([
      'Error: Bad chart data',
      'Error: Chart data is empty',
      'Error: Chart data is empty',
    ]);
    expect(reporter.entries.every((entry) => entry.widget === 'chart' && entry.buildVersion === VERSION)).toBe(true);
    http.verify();
  });

  it('does not report the expected 404 from the profile widget', async () => {
    const { fixture, host, reporter, http } = render(dashboard);
    await fixture.whenStable();

    expect(textOf(widget(host, 'profile').querySelector('.m37-profile'))).toBe('No profile yet');
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(reporter.entries).toEqual([]);
    http.verify();
  });
});
