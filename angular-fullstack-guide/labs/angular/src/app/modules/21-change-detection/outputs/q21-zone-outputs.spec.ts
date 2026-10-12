import 'zone.js';
// Zone-based Output questions of Module 21. zone.js is imported for this file only, so the other specs stay zoneless.
// The host is Eager on purpose: an OnPush host would gate its children.
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  createComponent,
  EnvironmentInjector,
  NgZone,
  provideZoneChangeDetection,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Every Output test pushes into this recorder where the answer's snippet calls console.log.
const lines: string[] = [];
const log = (line: string): number => lines.push(line);

// The test body runs outside the angular zone, so this wait is a plain root-zone timer.
const settle = (ms = 50) => new Promise<void>((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  lines.length = 0;
});

afterEach(() => {
  document.body.replaceChildren();
});

// Q21.09: a timer writes a plain field of an Eager and of an OnPush component.
// Eager on purpose: an Eager view is checked whenever the walk reaches it.
@Component({
  selector: 'lab-m21-q09-eager',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ field }}`,
})
class Q09Eager {
  field = 'a';
}

@Component({ selector: 'lab-m21-q09-push', template: `{{ field }}` })
class Q09Push {
  field = 'a';
}

@Component({
  selector: 'lab-m21-q09-host',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Q09Eager, Q09Push],
  template: `<lab-m21-q09-eager /><lab-m21-q09-push />`,
})
class Q09Host {
  readonly eager = viewChild.required(Q09Eager);
  readonly push = viewChild.required(Q09Push);
}

async function mount(): Promise<{ host: Q09Host; element: HTMLElement; zone: NgZone }> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZoneChangeDetection()] });
  const zone = TestBed.inject(NgZone);
  const app = TestBed.inject(ApplicationRef);
  const injector = TestBed.inject(EnvironmentInjector);
  const ref = zone.run(() => {
    const created = createComponent(Q09Host, { environmentInjector: injector });
    document.body.appendChild(created.location.nativeElement);
    app.attachView(created.hostView);
    return created;
  });
  await settle();
  return { host: ref.instance, element: ref.location.nativeElement as HTMLElement, zone };
}

describe('Q21 zone outputs', () => {
  it('Q21.09 a timer inside the zone renders the Eager field and not the OnPush one, a timer outside renders neither until a zone task', async () => {
    const write = (host: Q09Host): void => {
      host.eager().field = 'b';
      host.push().field = 'b';
    };
    const report = (step: string, element: HTMLElement): void => {
      const text = (tag: string): string => element.querySelector(tag)?.textContent ?? '';
      log(`${step}: eager ${text('lab-m21-q09-eager')}, push ${text('lab-m21-q09-push')}`);
    };

    const inside = await mount();
    inside.zone.run(() => setTimeout(() => write(inside.host), 0));
    await settle();
    report('inside the zone', inside.element);

    const outside = await mount();
    outside.zone.runOutsideAngular(() => setTimeout(() => write(outside.host), 0));
    await settle();
    report('outside the zone', outside.element);

    outside.zone.run(() => setTimeout(() => undefined, 0));
    await settle();
    report('after an empty zone timer', outside.element);

    expect(lines).toEqual([
      'inside the zone: eager b, push a',
      'outside the zone: eager a, push a',
      'after an empty zone timer: eager b, push a',
    ]);
  });
});
