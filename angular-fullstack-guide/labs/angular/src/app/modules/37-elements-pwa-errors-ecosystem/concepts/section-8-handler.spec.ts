import { Component, ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m37-s8-listener',
  template: `<button type="button" (click)="boom()">go</button>`,
})
class ListenerHost {
  boom(): void {
    throw new Error('listener boom');
  }
}

@Component({
  selector: 'lab-m37-s8-template',
  template: `<p>{{ boom() }}</p>`,
})
class TemplateHost {
  boom(): string {
    throw new Error('template boom');
  }
}

@Component({
  selector: 'lab-m37-s8-timeout',
  template: `<button type="button" (click)="later()">go</button>`,
})
class TimeoutHost {
  later(): void {
    setTimeout(() => {
      throw new Error('timeout boom');
    });
  }
}

/** A handler that records every error it is given. */
function recordingHandler(): { errors: unknown[]; provider: { provide: typeof ErrorHandler; useValue: ErrorHandler } } {
  const errors: unknown[] = [];
  return { errors, provider: { provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } } };
}

describe('Section 8: what reaches the ErrorHandler', () => {
  it('Section 8: an error thrown in a click listener reaches the custom ErrorHandler', async () => {
    const { errors, provider } = recordingHandler();
    TestBed.configureTestingModule({ rethrowApplicationErrors: false, providers: [provider] });
    const fixture = TestBed.createComponent(ListenerHost);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    await fixture.whenStable();

    expect(errors.map((error) => (error instanceof Error ? error.message : error))).toEqual(['listener boom']);
  });

  it('Section 8: an error thrown in a template expression reaches the custom ErrorHandler', async () => {
    const { errors, provider } = recordingHandler();
    TestBed.configureTestingModule({ rethrowApplicationErrors: false, providers: [provider] });
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();

    expect(errors.map((error) => (error instanceof Error ? error.message : error))).toContain('template boom');
  });

  it('Section 8: an error in a setTimeout callback does not reach ErrorHandler without global listeners', async () => {
    const { errors, provider } = recordingHandler();
    TestBed.configureTestingModule({ rethrowApplicationErrors: false, providers: [provider] });
    const fixture = TestBed.createComponent(TimeoutHost);
    await fixture.whenStable();

    // Fake timers keep the throwing callback inside the test: nothing runs until the test runs it.
    vi.useFakeTimers();
    try {
      (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
      expect(() => vi.runAllTimers()).toThrow('timeout boom');
    } finally {
      vi.useRealTimers();
    }

    expect(errors).toEqual([]);
  });
});
