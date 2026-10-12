import { Component, ErrorHandler, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM18Failing } from './fixtures/lab-m18-failing';
import { LabM18Quick } from './fixtures/lab-m18-quick';
import { LabM18Slow } from './fixtures/lab-m18-slow';

// --- Hosts: one @defer each, a sub-block per state, an id per sub-block ---

@Component({
  selector: 'lab-m18-s5-when',
  imports: [LabM18Quick],
  template: `
    @defer (when ready()) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class WhenHost {
  readonly ready = signal(false);
}

@Component({
  selector: 'lab-m18-s5-after-slow',
  imports: [LabM18Slow],
  template: `
    @defer (on immediate) {
      <lab-m18-slow />
    } @loading (after 40ms) {
      <p id="loading">loading</p>
    }
  `,
})
class AfterSlowHost {}

@Component({
  selector: 'lab-m18-s5-after-quick',
  imports: [LabM18Quick],
  template: `
    @defer (on immediate) {
      <lab-m18-quick />
    } @loading (after 60ms) {
      <p id="loading">loading</p>
    }
  `,
})
class AfterQuickHost {}

@Component({
  selector: 'lab-m18-s5-loading-minimum',
  imports: [LabM18Quick],
  template: `
    @defer (on immediate) {
      <lab-m18-quick />
    } @loading (minimum 100ms) {
      <p id="loading">loading</p>
    }
  `,
})
class LoadingMinimumHost {}

@Component({
  selector: 'lab-m18-s5-placeholder-minimum',
  imports: [LabM18Quick],
  template: `
    @defer {
      <lab-m18-quick />
    } @placeholder (minimum 80ms) {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class PlaceholderMinimumHost {}

@Component({
  selector: 'lab-m18-s5-immediate-loading',
  imports: [LabM18Quick],
  template: `
    @defer (on immediate) {
      <lab-m18-quick />
    } @placeholder (minimum 80ms) {
      <p id="placeholder">placeholder</p>
    } @loading {
      <p id="loading">loading</p>
    }
  `,
})
class ImmediateLoadingHost {}

@Component({
  selector: 'lab-m18-s5-error',
  imports: [LabM18Failing],
  template: `
    @defer (on immediate) {
      <lab-m18-failing />
    } @error {
      <p id="error">error</p>
    }
  `,
})
class ErrorHost {}

@Component({
  selector: 'lab-m18-s5-no-error',
  imports: [LabM18Failing],
  template: `
    @defer (on immediate) {
      <lab-m18-failing />
    }
  `,
})
class NoErrorHost {}

@Component({
  selector: 'lab-m18-s5-placeholder-no-error',
  imports: [LabM18Failing],
  template: `
    @defer (on immediate) {
      <lab-m18-failing />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class PlaceholderNoErrorHost {}

// --- Helpers: poll the DOM and record when each sub-block is first seen ---

type Seen = Partial<Record<'placeholder' | 'loading' | 'content' | 'error', number>>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Detects changes every few milliseconds and records the first sighting of each sub-block. */
async function watch(fixture: ComponentFixture<unknown>, windowMs: number): Promise<Seen> {
  const root: HTMLElement = fixture.nativeElement;
  const seen: Seen = {};
  const start = performance.now();
  const sample = () => {
    fixture.detectChanges();
    const at = performance.now() - start;
    for (const id of ['placeholder', 'loading', 'content', 'error'] as const) {
      if (seen[id] === undefined && root.querySelector(`#${id}`)) {
        seen[id] = at;
      }
    }
  };
  sample();
  while (performance.now() - start < windowMs) {
    await sleep(4);
    sample();
  }
  return seen;
}

// A margin for timers: a callback may run a few milliseconds early against a second clock.
const SLACK = 10;

describe('Section 5: @defer states', () => {
  it('Section 5: the content replaces the placeholder once the trigger fires', async () => {
    const fixture = TestBed.createComponent(WhenHost);
    const before = await watch(fixture, 60);
    expect(before.placeholder).toBeLessThan(20);
    expect(before.content).toBeUndefined();

    fixture.componentInstance.ready.set(true);
    const after = await watch(fixture, 200);
    expect(after.content).toBeDefined();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#placeholder')).toBeNull();
  });

  it('Section 5: @loading after delays the loading block and a fast load never shows it', async () => {
    const slow = await watch(TestBed.createComponent(AfterSlowHost), 500);
    expect(slow.loading).toBeGreaterThanOrEqual(40 - SLACK);
    expect(slow.content).toBeGreaterThan(slow.loading!);
    expect(slow.content).toBeGreaterThanOrEqual(100);

    const quick = await watch(TestBed.createComponent(AfterQuickHost), 250);
    expect(quick.content).toBeDefined();
    expect(quick.loading).toBeUndefined();
  });

  it('Section 5: @loading minimum holds the loading block', async () => {
    const seen = await watch(TestBed.createComponent(LoadingMinimumHost), 300);
    expect(seen.loading).toBeLessThan(50);
    expect(seen.content).toBeGreaterThanOrEqual(100 - SLACK);
  });

  it('Section 5: @placeholder minimum holds the placeholder', async () => {
    const seen = await watch(TestBed.createComponent(PlaceholderMinimumHost), 300);
    expect(seen.placeholder).toBeLessThan(20);
    expect(seen.content).toBeGreaterThanOrEqual(80 - SLACK);
  });

  it('Section 5: with on immediate and a @loading block the placeholder is never rendered', async () => {
    const seen = await watch(TestBed.createComponent(ImmediateLoadingHost), 300);
    expect(seen.placeholder).toBeUndefined();
    expect(seen.loading).toBeDefined();
    expect(seen.content).toBeDefined();
  });

  it('Section 5: a failed load renders the @error block', async () => {
    const seen = await watch(TestBed.createComponent(ErrorHost), 200);
    expect(seen.error).toBeDefined();
    expect(seen.content).toBeUndefined();
  });

  it('Section 5: a failed load without @error reports NG0750 to the ErrorHandler', async () => {
    const reported: string[] = [];
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [
        {
          provide: ErrorHandler,
          useValue: { handleError: (error: unknown) => reported.push(String(error)) },
        },
      ],
    });
    const seen = await watch(TestBed.createComponent(NoErrorHost), 200);
    expect(seen.content).toBeUndefined();
    expect(seen.error).toBeUndefined();
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('NG0750: Loading dependencies for `@defer` block failed');
    expect(reported[0]).toContain('no `@error` block was configured');
    expect(reported[0]).toContain('Consider using the `@error` block to render an error state.');
  });

  it('Section 5: a failed load with a @placeholder and no @error leaves the placeholder on the page', async () => {
    const reported: string[] = [];
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [
        {
          provide: ErrorHandler,
          useValue: { handleError: (error: unknown) => reported.push(String(error)) },
        },
      ],
    });
    const fixture = TestBed.createComponent(PlaceholderNoErrorHost);
    const seen = await watch(fixture, 200);
    const root: HTMLElement = fixture.nativeElement;
    expect(seen.placeholder).toBeDefined();
    expect(seen.content).toBeUndefined();
    expect(seen.error).toBeUndefined();
    expect(root.querySelector('#placeholder')).not.toBeNull();
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('NG0750: Loading dependencies for `@defer` block failed');
  });
});
