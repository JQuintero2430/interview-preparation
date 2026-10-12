import { Component, Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Busy } from './busy';

@Component({
  selector: 'lab-busy-host',
  imports: [Busy],
  template: `
    <section (click)="parentClicks.update((n) => n + 1)">
      <div id="target" [labBusy]="busy()" (activated)="activations.update((n) => n + 1)">
        <span id="child" (click)="childClicks.update((n) => n + 1)">child</span>
      </div>
    </section>
    <p id="bare" labBusy></p>
    <p id="exposed" #b="labBusy" [labBusy]="busy()">{{ b.isBusy() }}</p>
  `,
})
class BusyHost {
  readonly busy = signal(true);
  readonly activations = signal(0);
  readonly childClicks = signal(0);
  readonly parentClicks = signal(0);
}

function setup() {
  const fixture = TestBed.createComponent(BusyHost);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const find = (selector: string) => root.querySelector(selector) as HTMLElement;
  return { fixture, host: fixture.componentInstance, find };
}

describe('E14.1 A busy-state directive', () => {
  it('`[labBusy]="true"` renders `aria-busy="true"`, `class="is-busy"` and a `disabled` attribute, and `false` removes all three', () => {
    const { fixture, host, find } = setup();
    const target = find('#target');
    expect(target.getAttribute('aria-busy')).toBe('true');
    expect(target.classList.contains('is-busy')).toBe(true);
    expect(target.hasAttribute('disabled')).toBe(true);

    host.busy.set(false);
    fixture.detectChanges();
    expect(target.hasAttribute('aria-busy')).toBe(false);
    expect(target.classList.contains('is-busy')).toBe(false);
    expect(target.hasAttribute('disabled')).toBe(false);
  });

  it('a bare `labBusy` attribute is busy (the `booleanAttribute` transform)', () => {
    const { find } = setup();
    const bare = find('#bare');
    expect(bare.getAttribute('aria-busy')).toBe('true');
    expect(bare.classList.contains('is-busy')).toBe(true);
  });

  it('`#b="labBusy"` exposes `b.isBusy()` to the template', () => {
    const { fixture, host, find } = setup();
    expect(find('#exposed').textContent).toBe('true');

    host.busy.set(false);
    fixture.detectChanges();
    expect(find('#exposed').textContent).toBe('false');
  });

  it('clicking while busy does not emit `activated` or reach an ancestor (a listener on a child still runs); clicking when idle emits once', () => {
    const { fixture, host, find } = setup();
    find('#child').click();
    find('#target').click();
    expect(host.activations()).toBe(0);
    expect(host.childClicks()).toBe(1);
    // Both clicks pass through the busy div, which stops them before the section.
    expect(host.parentClicks()).toBe(0);

    host.busy.set(false);
    fixture.detectChanges();
    find('#target').click();
    expect(host.activations()).toBe(1);
    expect(host.parentClicks()).toBe(1);
  });

  it('toggling the input back and forth leaves no duplicate classes and no stale attribute', () => {
    const { fixture, host, find } = setup();
    const target = find('#target');
    for (const busy of [false, true, false, true, false]) {
      host.busy.set(busy);
      fixture.detectChanges();
    }
    expect(target.getAttribute('class')).toBe('');
    expect(target.hasAttribute('aria-busy')).toBe(false);
    expect(target.hasAttribute('disabled')).toBe(false);

    host.busy.set(true);
    fixture.detectChanges();
    expect(target.getAttribute('class')).toBe('is-busy');
  });

  it('the directive injects nothing: it can be built in an injector that provides nothing', () => {
    const empty = Injector.create({ providers: [] });
    const busy = runInInjectionContext(empty, () => new Busy());
    expect(busy.isBusy()).toBe(false);
  });
});
