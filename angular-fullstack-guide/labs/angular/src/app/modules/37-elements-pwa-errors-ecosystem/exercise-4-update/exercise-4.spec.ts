import { type Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { SwUpdate, type UnrecoverableStateEvent, type VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { LabM37Ex4UpdateBannerA } from '../../../../../projects/elements-lab/src/app/m37/exercise-4-update/a/update-banner';
import { LabM37Ex4UpdateBannerB } from '../../../../../projects/elements-lab/src/app/m37/exercise-4-update/b/update-banner';
import { RELOAD } from '../../../../../projects/elements-lab/src/app/m37/exercise-4-update/update-shell';
import { REPORTER, RecordingReporter } from '../exercise-3-errors/reporter';

// Criteria 3 and 4 of Exercise 37.4 under jsdom: no worker exists here, so `SwUpdate` is a fake whose streams are Subjects
// the test pushes events into. Criteria 1, 2 and 5 run in Chromium (labs/e2e .../exercise-4-update/exercise-4.spec.ts).

const banners: Record<'a' | 'b', Type<unknown>> = {
  a: LabM37Ex4UpdateBannerA,
  b: LabM37Ex4UpdateBannerB,
};
const variantNames: ReadonlyArray<'a' | 'b'> = ['a', 'b'];

interface Rig {
  readonly fixture: ComponentFixture<unknown>;
  readonly host: HTMLElement;
  readonly versionUpdates: Subject<VersionEvent>;
  readonly unrecoverable: Subject<UnrecoverableStateEvent>;
  readonly reporter: RecordingReporter;
  readonly reloads: { count: number };
}

/** Renders a variant with a fake `SwUpdate`, the recording reporter of Exercise 37.3 and a reload that only counts. */
function render(banner: Type<unknown>): Rig {
  const versionUpdates = new Subject<VersionEvent>();
  const unrecoverable = new Subject<UnrecoverableStateEvent>();
  const reporter = new RecordingReporter();
  const reloads = { count: 0 };
  TestBed.configureTestingModule({
    providers: [
      // The fake has only what the shell reads; `useValue` keeps it free of a cast to the real class.
      { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates, unrecoverable, checkForUpdate: () => Promise.resolve(false) } },
      { provide: REPORTER, useValue: reporter },
      { provide: RELOAD, useValue: () => { reloads.count += 1; } },
    ],
  });
  const fixture = TestBed.createComponent(banner);
  fixture.detectChanges();
  const host: HTMLElement = fixture.nativeElement;
  return { fixture, host, versionUpdates, unrecoverable, reporter, reloads };
}

function textOf(element: Element | null): string {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe.each(variantNames)('Exercise 37.4: update-aware shell, variant %s', (variant) => {
  it('reports a failed version installation to the error reporter', () => {
    const rig = render(banners[variant]);

    rig.versionUpdates.next({
      type: 'VERSION_INSTALLATION_FAILED',
      version: { hash: 'lab-v2-hash', appData: { version: 'v2' } },
      error: 'Hash mismatch (cacheBustedFetchFromNetwork): /main-LAB.js',
    });
    rig.fixture.detectChanges();

    expect(rig.reporter.entries).toEqual([
      { message: 'Version v2 failed to install: Hash mismatch (cacheBustedFetchFromNetwork): /main-LAB.js', widget: 'update-banner', buildVersion: 'v1' },
    ]);
    const update = rig.host.querySelector('[role="status"][aria-label="Update"]');
    expect(textOf(update)).toBe('Version v2 could not be installed. This tab keeps running v1.');
    expect(rig.reloads.count).toBe(0);
  });

  it('tells the user to reload when the service worker reports an unrecoverable state', () => {
    const rig = render(banners[variant]);
    expect(rig.host.querySelector('[role="alert"]')).toBeNull();

    rig.unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'Failed to retrieve hashed resource from the server' });
    rig.fixture.detectChanges();

    const alert = rig.host.querySelector('[role="alert"]');
    expect(textOf(alert?.querySelector('p') ?? null)).toBe(
      'This page cannot continue (Failed to retrieve hashed resource from the server). Reload it to get a working version.',
    );
    const reload = alert?.querySelector<HTMLButtonElement>('button') ?? null;
    expect(textOf(reload)).toBe('Reload page');
    reload?.click();
    expect(rig.reloads.count).toBe(1);
    expect(rig.reporter.entries).toEqual([]);
  });
});
