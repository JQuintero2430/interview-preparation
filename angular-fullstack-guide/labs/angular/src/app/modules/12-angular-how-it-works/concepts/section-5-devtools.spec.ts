import { Component, isDevMode, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// The debugging utilities Angular publishes on `window.ng` in development mode (the ones Angular DevTools uses).
interface NgGlobalUtils {
  getComponent<T>(element: Element): T | null;
  getHostElement(componentOrDirective: object): Element;
  applyChanges(component: object): void;
}

function ngGlobal(): NgGlobalUtils | undefined {
  return (globalThis as { ng?: NgGlobalUtils }).ng;
}

@Component({
  selector: 'lab-counter-badge',
  template: `<span>{{ count() }}</span>`,
})
class CounterBadge {
  readonly count = signal(3);
}

describe('Section 5: the dev loop', () => {
  it('Section 5: in development mode the ng global finds the component instance for a host element', async () => {
    const fixture = TestBed.createComponent(CounterBadge);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const ng = ngGlobal();

    expect(ng).toBeDefined();
    expect(ng?.getComponent<CounterBadge>(host)).toBe(fixture.componentInstance);
    expect(ng?.getHostElement(fixture.componentInstance)).toBe(host);
    const span = host.querySelector('span');
    expect(span).not.toBeNull();
    expect(ng?.getComponent(span as Element)).toBeNull(); // a plain element hosts no component

    // applyChanges renders synchronously, as the DevTools console shortcut does, without awaiting stability.
    fixture.componentInstance.count.set(5);
    ng?.applyChanges(fixture.componentInstance);
    expect(span?.textContent).toBe('5');
  });

  it('Section 5: isDevMode is true in the test build', () => {
    expect(isDevMode()).toBe(true);
  });
});
