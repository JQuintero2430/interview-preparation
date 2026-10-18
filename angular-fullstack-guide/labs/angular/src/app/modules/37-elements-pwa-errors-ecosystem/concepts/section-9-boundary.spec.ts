import {
  Component,
  EnvironmentInjector,
  ErrorHandler,
  createComponent,
  input,
  signal,
  type ErrorDetails,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** A chart that throws while its template is checked when the data holds a negative number. */
@Component({
  selector: 'lab-m37-s9-chart',
  template: `<p>Total: {{ total() }}</p>`,
})
class LabM37S9Chart {
  readonly data = input.required<readonly number[]>();

  total(): number {
    if (this.data().some((value) => value < 0)) {
      throw new Error('bad data');
    }
    return this.data().reduce((sum, value) => sum + value, 0);
  }
}

@Component({
  selector: 'lab-m37-s9-dashboard',
  imports: [LabM37S9Chart],
  template: `
    <p>Header still here</p>
    @boundary {
      <lab-m37-s9-chart [data]="data()" />
    } @error {
      <p role="alert">Chart failed: {{ $error.message }}</p>
      <button type="button" (click)="$reset()">Try again</button>
    }
    <p>Footer still here</p>
  `,
})
class LabM37S9Dashboard {
  readonly data = signal<readonly number[]>([1, 2, 3]);
}

type FailureKind = 'network' | 'parse';

@Component({
  selector: 'lab-m37-s9-thrower',
  template: `<p>{{ fail() }}</p>`,
})
class LabM37S9Thrower {
  readonly kind = input.required<FailureKind>();

  fail(): string {
    throw new Error(this.kind() === 'network' ? 'network' : 'parse failure');
  }
}

@Component({
  selector: 'lab-m37-s9-when',
  imports: [LabM37S9Thrower],
  template: `
    @boundary {
      <lab-m37-s9-thrower [kind]="kind()" />
    } @error (let err; reset = $reset; when err.message === 'network') {
      <p role="alert">first: {{ err.message }}</p>
      <button type="button" (click)="reset()">Retry</button>
    } @error (when $error.message.startsWith('net')) {
      <p role="alert">second: {{ $error.message }}</p>
    } @error {
      <p role="alert">catch-all: {{ $error.message }}</p>
    }
  `,
})
class LabM37S9When {
  readonly kind = signal<FailureKind>('network');
}

@Component({
  selector: 'lab-m37-s9-listener-box',
  template: `<button type="button" (click)="save()">Save</button>`,
})
class LabM37S9ListenerBox {
  save(): void {
    throw new Error('listener boom');
  }
}

@Component({
  selector: 'lab-m37-s9-listener-host',
  imports: [LabM37S9ListenerBox],
  template: `
    @boundary {
      <lab-m37-s9-listener-box />
    } @error {
      <p role="alert">fallback</p>
    }
  `,
})
class LabM37S9ListenerHost {}

@Component({
  selector: 'lab-m37-s9-first-render',
  template: `<p>{{ boom() }}</p>`,
})
class LabM37S9FirstRender {
  boom(): string {
    throw new Error('first render boom');
  }
}

@Component({
  selector: 'lab-m37-s9-constructor',
  template: `<p>never</p>`,
})
class LabM37S9Constructor {
  constructor() {
    throw new Error('constructor boom');
  }
}

interface ViewErrorCall {
  message: string;
  declarationType: Type<unknown>;
  boundaryType: Type<unknown> | undefined;
  hasReset: boolean;
}

/** A handler that records `handleError` and, when asked, `onViewError` calls. */
function recordingHandler(withViewError: boolean): {
  handled: string[];
  viewErrors: ViewErrorCall[];
  provider: { provide: typeof ErrorHandler; useValue: ErrorHandler };
} {
  const handled: string[] = [];
  const viewErrors: ViewErrorCall[] = [];
  const handler: ErrorHandler = {
    handleError: (error: unknown) => handled.push(error instanceof Error ? error.message : String(error)),
  };
  if (withViewError) {
    handler.onViewError = (error: Error, details: ErrorDetails) =>
      viewErrors.push({
        message: error.message,
        declarationType: details.declarationType,
        boundaryType: details.boundary?.type,
        hasReset: typeof details.boundary?.reset === 'function',
      });
  }
  return { handled, viewErrors, provider: { provide: ErrorHandler, useValue: handler } };
}

function paragraphs(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll('p'), (p) => (p.textContent ?? '').trim());
}

function alertText(host: HTMLElement): string | null {
  return host.querySelector('[role="alert"]')?.textContent?.trim() ?? null;
}

describe('Section 9: error boundaries', () => {
  it('Section 9: a child that throws during change detection shows the @error block and leaves siblings rendered', async () => {
    const { handled, provider } = recordingHandler(false);
    TestBed.configureTestingModule({ providers: [provider] });
    const fixture = TestBed.createComponent(LabM37S9Dashboard);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(paragraphs(host)).toEqual(['Header still here', 'Total: 6', 'Footer still here']);

    fixture.componentInstance.data.set([1, -2]);
    await fixture.whenStable();

    expect(alertText(host)).toBe('Chart failed: bad data');
    expect(host.querySelector('lab-m37-s9-chart')).toBeNull();
    expect(paragraphs(host)).toEqual(['Header still here', 'Chart failed: bad data', 'Footer still here']);
    expect(handled).toEqual(['bad data']);
  });

  it('Section 9: $reset re-creates the content after the cause is fixed', async () => {
    const { provider } = recordingHandler(false);
    TestBed.configureTestingModule({ providers: [provider] });
    const fixture = TestBed.createComponent(LabM37S9Dashboard);
    fixture.componentInstance.data.set([-1]);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(alertText(host)).toBe('Chart failed: bad data');

    // Fixing the data alone does not bring the content back: the boundary keeps its error.
    fixture.componentInstance.data.set([4, 5]);
    await fixture.whenStable();
    expect(alertText(host)).toBe('Chart failed: bad data');

    host.querySelector('button')?.click();
    await fixture.whenStable();

    expect(alertText(host)).toBeNull();
    expect(paragraphs(host)).toEqual(['Header still here', 'Total: 9', 'Footer still here']);
  });

  it('Section 9: the first matching when block wins and the unconditional block catches the rest', async () => {
    const { provider } = recordingHandler(false);
    TestBed.configureTestingModule({ providers: [provider] });
    const fixture = TestBed.createComponent(LabM37S9When);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // 'network' matches both conditional blocks; the first one in source order is rendered.
    expect(alertText(host)).toBe('first: network');

    fixture.componentInstance.kind.set('parse');
    host.querySelector('button')?.click();
    await fixture.whenStable();

    expect(alertText(host)).toBe('catch-all: parse failure');
  });

  it('Section 9: onViewError receives the error with boundary details', async () => {
    const { handled, viewErrors, provider } = recordingHandler(true);
    TestBed.configureTestingModule({ providers: [provider] });
    const fixture = TestBed.createComponent(LabM37S9Dashboard);
    await fixture.whenStable();

    fixture.componentInstance.data.set([-3]);
    await fixture.whenStable();

    expect(viewErrors).toEqual([
      { message: 'bad data', declarationType: LabM37S9Chart, boundaryType: LabM37S9Dashboard, hasReset: true },
    ]);
    expect(handled).toEqual([]);
  });

  it('Section 9: an error in a click listener inside the boundary reaches ErrorHandler and keeps the content', async () => {
    const { handled, viewErrors, provider } = recordingHandler(true);
    TestBed.configureTestingModule({ rethrowApplicationErrors: false, providers: [provider] });
    const fixture = TestBed.createComponent(LabM37S9ListenerHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    host.querySelector('button')?.click();
    await fixture.whenStable();

    expect(handled).toEqual(['listener boom']);
    expect(viewErrors).toEqual([]);
    expect(alertText(host)).toBeNull();
    expect(host.querySelector('button')?.textContent).toBe('Save');
  });

  it('Section 9: createComponent with onError reports a creation error to the callback', () => {
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const caught: { message: string; declarationType: Type<unknown> }[] = [];
    const onError = (error: Error, details: ErrorDetails): void => {
      caught.push({ message: error.message, declarationType: details.declarationType });
    };

    // An error in the first render of a newly created component goes to onError, not out of detectChanges.
    const ref = createComponent(LabM37S9FirstRender, {
      environmentInjector,
      hostElement: document.createElement('div'),
      onError,
    });
    expect(() => ref.changeDetectorRef.detectChanges()).not.toThrow();
    expect(caught).toEqual([{ message: 'first render boom', declarationType: LabM37S9FirstRender }]);
    ref.destroy();

    // A constructor error is thrown by createComponent itself; onError is not called for it.
    expect(() =>
      createComponent(LabM37S9Constructor, {
        environmentInjector,
        hostElement: document.createElement('div'),
        onError,
      }),
    ).toThrow('constructor boom');
    expect(caught).toHaveLength(1);
  });
});
