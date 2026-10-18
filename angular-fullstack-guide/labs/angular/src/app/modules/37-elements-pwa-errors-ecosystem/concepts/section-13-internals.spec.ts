import { ApplicationRef, Component, Injector, input, provideZonelessChangeDetection } from '@angular/core';
import { createCustomElement, type NgElementStrategy, type NgElementStrategyEvent, type NgElementStrategyFactory } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { NEVER, type Observable } from 'rxjs';

const created = { count: 0 };

@Component({
  selector: 'lab-m37-s13-badge',
  template: `<span class="m37-s13-label">{{ label() }}</span><span class="m37-s13-tone">{{ tone() }}</span>`,
})
class LabM37S13Badge {
  readonly label = input('none');
  readonly tone = input('plain');

  constructor() {
    created.count += 1;
  }
}

interface BadgeElement extends HTMLElement {
  label?: string;
}

/** A strategy that only records what the element asks of it (public `NgElementStrategy` interface, no Angular internals). */
class LabM37RecordingStrategy implements NgElementStrategy {
  readonly events: Observable<NgElementStrategyEvent> = NEVER;

  constructor(private readonly calls: string[]) {}

  connect(element: HTMLElement): void {
    this.calls.push(`connect ${element.localName}`);
  }

  disconnect(): void {
    this.calls.push('disconnect');
  }

  getInputValue(propName: string): string {
    this.calls.push(`get ${propName}`);
    return 'recorded';
  }

  setInputValue(propName: string, value: string): void {
    this.calls.push(`set ${propName}=${value}`);
  }
}

class LabM37RecordingFactory implements NgElementStrategyFactory {
  readonly calls: string[] = [];

  create(): NgElementStrategy {
    this.calls.push('create');
    return new LabM37RecordingStrategy(this.calls);
  }
}

function text(element: HTMLElement, selector: string): string {
  return element.querySelector(selector)?.textContent ?? '';
}

describe('Section 13: Under the hood', () => {
  let appRef: ApplicationRef;
  let injector: Injector;

  beforeEach(async () => {
    created.count = 0;
    appRef = await createApplication({ providers: [provideZonelessChangeDetection()] });
    injector = appRef.injector;
  });

  afterEach(() => {
    vi.useRealTimers();
    appRef.destroy();
  });

  it('Section 13: inputs set before connect are applied when the component is created', async () => {
    customElements.define('m37-s13-queued', createCustomElement(LabM37S13Badge, { injector }));
    const element: BadgeElement = document.createElement('m37-s13-queued');
    element.label = 'queued';
    element.setAttribute('tone', 'warm');

    expect(created.count).toBe(0);
    expect(element.label).toBe('queued');
    expect(element.children.length).toBe(0);

    document.body.append(element);
    await appRef.whenStable();

    expect(created.count).toBe(1);
    expect(text(element, '.m37-s13-label')).toBe('queued');
    expect(text(element, '.m37-s13-tone')).toBe('warm');

    vi.useFakeTimers();
    element.remove();
    vi.advanceTimersByTime(10);
  });

  it('Section 13: a custom strategyFactory receives connect and disconnect calls', () => {
    const factory = new LabM37RecordingFactory();
    const elementClass = createCustomElement(LabM37S13Badge, { injector, strategyFactory: factory });
    customElements.define('m37-s13-recorded', elementClass);
    const element: BadgeElement = document.createElement('m37-s13-recorded');

    element.setAttribute('tone', 'cool');
    document.body.append(element);
    const label = element.label;
    element.remove();

    expect(elementClass.observedAttributes).toEqual(['label', 'tone']);
    expect(factory.calls).toEqual(['create', 'set tone=cool', 'connect m37-s13-recorded', 'get label', 'disconnect']);
    expect(label).toBe('recorded');
    expect(created.count).toBe(0);
    expect(element.childNodes.length).toBe(0);
  });
});
