import 'zone.js';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  createComponent,
  DoCheck,
  EnvironmentInjector,
  NgZone,
  provideZoneChangeDetection,
  signal,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// --- A recorder: each template method pushes its name; ngDoCheck counts the refreshes of its parent's view ---

const ran: string[] = [];

// --- Two children: Eager on purpose (checked whenever the walk reaches it) and OnPush (the v22 default) ---

@Component({
  selector: 'lab-m21-s3-eager-child',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ tpl() }}{{ field }}`,
})
class EagerChild implements DoCheck {
  field = 'a';
  doChecks = 0;

  ngDoCheck(): void {
    this.doChecks += 1;
  }

  protected tpl(): string {
    ran.push('eager-child');
    return '';
  }
}

@Component({ selector: 'lab-m21-s3-push-child', template: `{{ tpl() }}{{ field }}` })
class PushChild {
  field = 'a';

  protected tpl(): string {
    ran.push('push-child');
    return '';
  }
}

// The host is Eager on purpose: an OnPush host would gate its children (section 4).
@Component({
  selector: 'lab-m21-s3-host',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EagerChild, PushChild],
  template: `<lab-m21-s3-eager-child /><lab-m21-s3-push-child /><span class="sig">{{
      sig()
    }}</span>`,
})
class ZoneHost {
  readonly sig = signal(0);
}

// --- Nested listeners: a click on the button runs the inner handler, then the outer one ---

@Component({
  selector: 'lab-m21-s3-nested',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EagerChild],
  template: `<div (click)="outer()"><button type="button" (click)="inner()">go</button></div>
    <lab-m21-s3-eager-child />`,
})
class Nested {
  calls: string[] = [];

  protected inner(): void {
    this.calls.push('inner');
  }

  protected outer(): void {
    this.calls.push('outer');
  }
}

// --- Mounting: a component made inside the angular zone and attached to the ApplicationRef, so the zone alone drives it ---

// The test body runs outside the angular zone, so this wait is a plain root-zone timer.
const settle = (ms = 50) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type ZoneOptions = Parameters<typeof provideZoneChangeDetection>[0];

async function mount<T>(
  type: Type<T>,
  options?: ZoneOptions,
): Promise<{ instance: T; element: HTMLElement; zone: NgZone }> {
  TestBed.configureTestingModule({ providers: [provideZoneChangeDetection(options)] });
  const zone = TestBed.inject(NgZone);
  const app = TestBed.inject(ApplicationRef);
  const injector = TestBed.inject(EnvironmentInjector);
  const ref = zone.run(() => {
    const created = createComponent(type, { environmentInjector: injector });
    document.body.appendChild(created.location.nativeElement);
    app.attachView(created.hostView);
    return created;
  });
  await settle();
  return { instance: ref.instance, element: ref.location.nativeElement as HTMLElement, zone };
}

function child<T>(element: HTMLElement, selector: string): T {
  // The component instance is reachable through the debug API of the element.
  return (globalThis as unknown as { ng: { getComponent(e: Element): T } }).ng.getComponent(
    element.querySelector(selector) as Element,
  );
}

describe('Section 3: zone.js and NgZone', () => {
  beforeEach(() => {
    ran.length = 0;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('Section 3: a timer inside the zone renders an Eager component and not an OnPush one', async () => {
    const { element, zone } = await mount(ZoneHost);
    const eager = child<EagerChild>(element, 'lab-m21-s3-eager-child');
    const push = child<PushChild>(element, 'lab-m21-s3-push-child');

    zone.run(() =>
      setTimeout(() => {
        eager.field = 'b';
        push.field = 'b';
      }, 0),
    );
    await settle();

    expect(element.querySelector('lab-m21-s3-eager-child')?.textContent).toBe('b');
    expect(element.querySelector('lab-m21-s3-push-child')?.textContent).toBe('a');
  });

  it('Section 3: a write outside the zone renders on the next zone task or signal write', async () => {
    const { instance, element, zone } = await mount(ZoneHost);
    const eager = child<EagerChild>(element, 'lab-m21-s3-eager-child');
    const text = () => element.querySelector('lab-m21-s3-eager-child')?.textContent;

    zone.runOutsideAngular(() =>
      setTimeout(() => {
        eager.field = 'b';
      }, 0),
    );
    await settle();
    expect(text()).toBe('a');

    zone.run(() => setTimeout(() => undefined, 0));
    await settle();
    expect(text()).toBe('b');

    zone.runOutsideAngular(() =>
      setTimeout(() => {
        eager.field = 'c';
        instance.sig.set(1);
      }, 0),
    );
    await settle();
    expect(text()).toBe('c');
    expect(element.querySelector('.sig')?.textContent).toBe('1');
  });

  it('Section 3: nested listeners tick twice and once with eventCoalescing', async () => {
    const turns: Record<string, number[]> = {};
    for (const [name, options] of [
      ['default', undefined],
      ['coalesced', { eventCoalescing: true }],
    ] as const) {
      TestBed.resetTestingModule();
      const { instance, element, zone } = await mount(Nested, options);
      const eager = child<EagerChild>(element, 'lab-m21-s3-eager-child');
      const before = eager.doChecks;
      let emptied = 0;
      const sub = zone.onMicrotaskEmpty.subscribe(() => (emptied += 1));

      (element.querySelector('button') as HTMLButtonElement).click();
      await settle();
      sub.unsubscribe();

      expect(instance.calls).toEqual(['inner', 'outer']);
      turns[name] = [emptied, eager.doChecks - before];
    }
    expect(turns).toEqual({ default: [2, 2], coalesced: [1, 1] });
  });

  it('Section 3: an idle zone timer still runs ngDoCheck of an Eager component', async () => {
    const { element, zone } = await mount(ZoneHost);
    const eager = child<EagerChild>(element, 'lab-m21-s3-eager-child');
    const before = eager.doChecks;
    ran.length = 0;

    zone.run(() => setTimeout(() => undefined, 0));
    await settle();

    expect(eager.doChecks).toBeGreaterThan(before);
    expect(ran).toContain('eager-child');
    expect(ran).not.toContain('push-child');
  });

  it('Section 3: onMicrotaskEmpty and onStable fire once per turn', async () => {
    const { element, zone } = await mount(Nested);
    const events: string[] = [];
    const subs = [
      zone.onUnstable.subscribe(() => events.push('onUnstable')),
      zone.onMicrotaskEmpty.subscribe(() => events.push('onMicrotaskEmpty')),
      zone.onStable.subscribe(() => events.push('onStable')),
    ];

    // A click that does not bubble reaches only the inner listener: one task, one turn.
    element.querySelector('button')?.dispatchEvent(new Event('click'));
    await settle();
    subs.forEach((s) => s.unsubscribe());

    expect(events).toEqual(['onUnstable', 'onMicrotaskEmpty', 'onStable']);
  });

  it('Section 3: zone.js patches setTimeout', () => {
    const original = (globalThis as unknown as Record<string, unknown>)[
      '__zone_symbol__setTimeout'
    ];
    expect(typeof original).toBe('function');
    expect(globalThis.setTimeout).not.toBe(original);
    const seen: string[] = [];
    Zone.current.fork({ name: 'lab-m21-probe' }).run(() => {
      setTimeout(() => seen.push(Zone.current.name), 0);
    });
    return settle().then(() => expect(seen).toEqual(['lab-m21-probe']));
  });
});
