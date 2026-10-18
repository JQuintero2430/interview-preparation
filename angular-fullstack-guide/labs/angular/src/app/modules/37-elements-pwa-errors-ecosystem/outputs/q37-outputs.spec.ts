import {
  ApplicationRef,
  Component,
  ErrorHandler,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  output,
  provideBrowserGlobalErrorListeners,
  signal,
  type ErrorDetails,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

// Output questions of module 37 (jsdom half): each test body is the snippet of its question.
// Custom element tags are unique per question (a registry cannot undefine).

@Component({
  selector: 'lab-m37-q02-raw',
  template: `{{ maxStars() }}:{{ typeOf(maxStars()) }}`,
})
class LabM37Q02Raw {
  readonly maxStars = input<unknown>();
  typeOf(value: unknown): string {
    return typeof value;
  }
}

@Component({
  selector: 'lab-m37-q02-num',
  template: `{{ maxStars() }}:{{ typeOf(maxStars()) }}`,
})
class LabM37Q02Num {
  readonly maxStars = input(0, { transform: numberAttribute });
  typeOf(value: unknown): string {
    return typeof value;
  }
}

@Component({
  selector: 'lab-m37-q03-rating',
  template: `<button type="button" (click)="ratingChanged.emit(4)">Rate</button>`,
})
class LabM37Q03Rating {
  readonly ratingChanged = output<number>();
}

describe('Q37.02 attribute versus property on an element, with and without numberAttribute', () => {
  let appRef: ApplicationRef;
  let injector: Injector;

  beforeEach(async () => {
    appRef = await createApplication();
    injector = appRef.injector;
  });

  afterEach(() => {
    appRef.destroy();
  });

  async function steps(tag: string): Promise<string[]> {
    const element = document.createElement(tag);
    element.setAttribute('max-stars', '5');
    document.body.append(element);
    await appRef.whenStable();
    const seen = [element.textContent];
    Object.assign(element, { maxStars: 7 });
    await appRef.whenStable();
    seen.push(element.textContent);
    element.setAttribute('max-stars', '3');
    await appRef.whenStable();
    seen.push(element.textContent);
    element.remove();
    return seen;
  }

  it('Q37.02 without a transform: "5" string, 7 number, "3" string', async () => {
    customElements.define('m37-q02-rating', createCustomElement(LabM37Q02Raw, { injector }));
    expect(await steps('m37-q02-rating')).toEqual(['5:string', '7:number', '3:string']);
  });

  it('Q37.02 with numberAttribute: 5, 7, 3, all numbers', async () => {
    customElements.define('m37-q02-rating-num', createCustomElement(LabM37Q02Num, { injector }));
    expect(await steps('m37-q02-rating-num')).toEqual(['5:number', '7:number', '3:number']);
  });
});

describe('Q37.03 the event an output becomes on the element', () => {
  let appRef: ApplicationRef;

  beforeEach(async () => {
    appRef = await createApplication();
  });

  afterEach(() => {
    appRef.destroy();
  });

  it('Q37.03 ratingChanged, detail 4, bubbles false, composed false, the parent listener does not fire', async () => {
    customElements.define('m37-q03-rating', createCustomElement(LabM37Q03Rating, { injector: appRef.injector }));
    const parent = document.createElement('div');
    const element = document.createElement('m37-q03-rating');
    parent.append(element);
    document.body.append(parent);
    await appRef.whenStable();

    const log: string[] = [];
    element.addEventListener('ratingChanged', (event) => {
      if (event instanceof CustomEvent) {
        log.push(`${event.type} ${event.detail} ${event.bubbles} ${event.composed}`);
      }
    });
    parent.addEventListener('ratingChanged', () => log.push('parent'));
    element.querySelector('button')?.click();
    await appRef.whenStable();

    expect(log).toEqual(['ratingChanged 4 false false']);
    parent.remove();
  });
});

@Component({
  selector: 'lab-m37-q06-widget',
  template: `widget`,
})
class LabM37Q06Widget implements OnDestroy {
  static log: string[] = [];
  constructor() {
    LabM37Q06Widget.log.push('constructor');
  }
  ngOnDestroy(): void {
    LabM37Q06Widget.log.push('ngOnDestroy');
  }
}

describe('Q37.06 an element re-appended within the destroy delay keeps its component', () => {
  let appRef: ApplicationRef;

  beforeEach(async () => {
    vi.useFakeTimers();
    LabM37Q06Widget.log = [];
    appRef = await createApplication();
  });

  afterEach(() => {
    appRef.destroy();
    vi.useRealTimers();
  });

  it('Q37.06 constructor once, ngOnDestroy once, only after the second removal outlasts the delay', () => {
    customElements.define('m37-q06-widget', createCustomElement(LabM37Q06Widget, { injector: appRef.injector }));
    const element = document.createElement('m37-q06-widget');
    document.body.append(element);

    element.remove();
    vi.advanceTimersByTime(5);
    document.body.append(element);
    expect(LabM37Q06Widget.log).toEqual(['constructor']);

    element.remove();
    vi.advanceTimersByTime(20);

    expect(LabM37Q06Widget.log).toEqual(['constructor', 'ngOnDestroy']);
  });
});

@Component({
  selector: 'lab-m37-q17-host',
  template: `
    <button type="button" (click)="clickBoom()">Click</button>
    @if (broken()) {
      <p>{{ templateBoom() }}</p>
    }
  `,
})
class LabM37Q17Host {
  readonly broken = signal(false);

  clickBoom(): void {
    throw new Error('click boom');
  }

  templateBoom(): string {
    throw new Error('template boom');
  }
}

describe('Q37.17 a recording ErrorHandler with the global listeners on: the click and template half', () => {
  it('Q37.17 a click error, then a template error: the handler records each once, in the order thrown', async () => {
    const recorded: unknown[] = [];
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [
        provideBrowserGlobalErrorListeners(),
        { provide: ErrorHandler, useValue: { handleError: (error: unknown) => recorded.push(error) } },
      ],
    });
    const fixture = TestBed.createComponent(LabM37Q17Host);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    await fixture.whenStable();
    fixture.componentInstance.broken.set(true);
    await fixture.whenStable();

    expect(recorded.every((error) => error instanceof Error)).toBe(true);
    expect(recorded.map((error) => (error instanceof Error ? error.message : String(error)))).toEqual(['click boom', 'template boom']);
  });
});

class LabM37Q19NetworkError extends Error {}

@Component({
  selector: 'lab-m37-q19-first',
  template: `<p>First child</p><p>{{ read() }}</p>`,
})
class LabM37Q19First {
  readonly broken = input.required<boolean>();

  read(): string {
    if (this.broken()) {
      // JSON.parse returns `any`: reading `.url` of null is a real TypeError at run time.
      return JSON.parse('null').url;
    }
    return 'ok';
  }
}

@Component({
  selector: 'lab-m37-q19-second',
  template: `<p>Second child</p>`,
})
class LabM37Q19Second {}

@Component({
  selector: 'lab-m37-q19-host',
  imports: [LabM37Q19First, LabM37Q19Second],
  template: `
    <p>Before boundary</p>
    @boundary {
      <lab-m37-q19-first [broken]="broken()" />
      <lab-m37-q19-second />
    } @error (when isNetwork($error)) {
      <p role="alert">Offline: try again later</p>
    } @error {
      <p role="alert">Unexpected: {{ $error.name }}</p>
      <button type="button" (click)="$reset()">Retry</button>
    }
    <p>After boundary</p>
  `,
})
class LabM37Q19Host {
  readonly broken = signal(false);

  isNetwork(error: unknown): boolean {
    return error instanceof LabM37Q19NetworkError;
  }
}

describe('Q37.19 a boundary with a conditional and a final @error around two children', () => {
  it('Q37.19 the final @error renders, onViewError gets the TypeError and boundary details, $reset after the fix re-creates both children', async () => {
    const viewErrors: { name: string; isTypeError: boolean; declarationType: Type<unknown>; boundaryType: Type<unknown> | undefined; hasReset: boolean }[] = [];
    const handled: unknown[] = [];
    const handler: ErrorHandler = {
      handleError: (error: unknown) => handled.push(error),
      onViewError: (error: Error, details: ErrorDetails) =>
        viewErrors.push({
          name: error.name,
          isTypeError: error instanceof TypeError,
          declarationType: details.declarationType,
          boundaryType: details.boundary?.type,
          hasReset: typeof details.boundary?.reset === 'function',
        }),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: handler }] });
    const fixture = TestBed.createComponent(LabM37Q19Host);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const texts = (): string[] => Array.from(host.querySelectorAll('p'), (p) => (p.textContent ?? '').trim());
    expect(texts()).toEqual(['Before boundary', 'First child', 'ok', 'Second child', 'After boundary']);

    fixture.componentInstance.broken.set(true);
    await fixture.whenStable();

    expect(texts()).toEqual(['Before boundary', 'Unexpected: TypeError', 'After boundary']);
    expect(viewErrors).toEqual([
      { name: 'TypeError', isTypeError: true, declarationType: LabM37Q19First, boundaryType: LabM37Q19Host, hasReset: true },
    ]);
    expect(handled).toEqual([]);

    fixture.componentInstance.broken.set(false);
    host.querySelector('button')?.click();
    await fixture.whenStable();

    expect(texts()).toEqual(['Before boundary', 'First child', 'ok', 'Second child', 'After boundary']);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(viewErrors).toHaveLength(1);
  });
});
