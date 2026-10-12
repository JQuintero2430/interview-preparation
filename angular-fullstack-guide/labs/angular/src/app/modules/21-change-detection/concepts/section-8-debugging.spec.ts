import {
  ApplicationRef,
  Component,
  ErrorHandler,
  provideCheckNoChangesConfig,
  signal,
  ɵProfilerEvent as ProfilerEvent,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// --- OnPush (the v22 default) with a plain field next to a signal: the field is the silent update ---

@Component({ selector: 'lab-m21-s8-board', template: `{{ open }}|{{ count() }}` })
class Board {
  open = 'a';
  readonly count = signal(0);
}

// --- The `ng` global that development builds publish; `ɵsetProfiler` is internal, typed here by hand ---

type ProfilerHook = (event: number, instance?: object | null) => void;

interface NgGlobal {
  ɵsetProfiler(hook: ProfilerHook | null): () => void;
}

const ngGlobal = () => (globalThis as unknown as { ng: NgGlobal }).ng;

const settle = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('Section 8: debugging change detection', () => {
  it('Section 8: the profiler hook reports the events of one signal-driven refresh', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.detectChanges();
    await fixture.whenStable();

    const events: string[] = [];
    const stop = ngGlobal().ɵsetProfiler((event) => events.push(ProfilerEvent[event]));
    fixture.componentInstance.count.set(1);
    await fixture.whenStable();
    stop();

    expect(events).toEqual([
      'ChangeDetectionStart',
      'ChangeDetectionSyncStart',
      'ComponentStart',
      'TemplateUpdateStart',
      'TemplateUpdateEnd',
      'ComponentEnd',
      'ChangeDetectionSyncEnd',
      'ChangeDetectionEnd',
    ]);
  });

  it('Section 8: exhaustive check reports a plain-field write in an OnPush component', async () => {
    TestBed.configureTestingModule({
      providers: [provideCheckNoChangesConfig({ exhaustive: true })],
    });
    const fixture = TestBed.createComponent(Board);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.open = 'x';

    expect(() => TestBed.inject(ApplicationRef).tick()).toThrowError(
      /NG0100.*Previous value: 'a'/s,
    );
    expect(() => fixture.detectChanges()).toThrowError(/NG0100.*Previous value: 'a'/s);
  });

  it('Section 8: the default check stays silent for it', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.open = 'x';
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('a|0');
  });

  it('Section 8: the interval check reports without a tick', async () => {
    const reported: unknown[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideCheckNoChangesConfig({ exhaustive: true, interval: 20 }),
        { provide: ErrorHandler, useValue: { handleError: (e: unknown) => reported.push(e) } },
      ],
    });
    const fixture = TestBed.createComponent(Board);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.open = 'x';
    await settle(120);

    expect(reported.length).toBeGreaterThan(0);
    expect(String(reported[0])).toMatch(/NG0100.*Previous value: 'a'/s);
    expect(fixture.nativeElement.textContent).toBe('a|0');
  });
});
