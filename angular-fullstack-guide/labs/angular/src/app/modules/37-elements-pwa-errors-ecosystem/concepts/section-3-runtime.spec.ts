import { ApplicationRef, Component, Injector, input, provideZonelessChangeDetection } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

const lifecycle = { created: 0, destroyed: 0 };

@Component({
  selector: 'lab-m37-s3-probe',
  template: `Value: {{ value() }}`,
})
class LabM37S3Probe {
  readonly value = input('first');

  constructor() {
    lifecycle.created += 1;
  }

  ngOnDestroy(): void {
    lifecycle.destroyed += 1;
  }
}

interface ValueElement extends HTMLElement {
  value?: string;
}

describe('Section 3: Elements at run time', () => {
  let appRef: ApplicationRef;
  let injector: Injector;

  beforeEach(async () => {
    lifecycle.created = 0;
    lifecycle.destroyed = 0;
    appRef = await createApplication({ providers: [provideZonelessChangeDetection()] });
    injector = appRef.injector;
  });

  afterEach(() => {
    vi.useRealTimers();
    appRef.destroy();
  });

  /** Defines a uniquely named element, connects it and waits for the first render with real timers. */
  async function connected(tag: string): Promise<ValueElement> {
    customElements.define(tag, createCustomElement(LabM37S3Probe, { injector }));
    const element: ValueElement = document.createElement(tag);
    document.body.append(element);
    await appRef.whenStable();
    expect(element.textContent).toBe('Value: first');
    return element;
  }

  it('Section 3: removing and re-adding the element within the delay keeps the same component instance', async () => {
    const element = await connected('m37-s3-keep');
    vi.useFakeTimers();

    element.remove();
    vi.advanceTimersByTime(5);
    document.body.append(element);
    vi.advanceTimersByTime(20);

    expect(lifecycle).toEqual({ created: 1, destroyed: 0 });
    element.remove();
    vi.advanceTimersByTime(10);
  });

  it('Section 3: the component is destroyed after the destroy delay', async () => {
    const element = await connected('m37-s3-destroy');
    vi.useFakeTimers();

    element.remove();
    expect(lifecycle.destroyed).toBe(0);
    vi.advanceTimersByTime(10);

    expect(lifecycle).toEqual({ created: 1, destroyed: 1 });
  });

  it('Section 3: a property set on the element re-renders without zone.js', async () => {
    const element = await connected('m37-s3-zoneless');

    element.value = 'second';
    await appRef.whenStable();

    expect(element.textContent).toBe('Value: second');
    expect(typeof (globalThis as { Zone?: unknown }).Zone).toBe('undefined');
    element.remove();
  });
});
