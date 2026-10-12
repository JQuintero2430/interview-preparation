import { Component, reflectComponentType, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// AOT-compiled by the test build into a static definition; dev and test builds also keep the
// decorator's metadata (ɵsetClassMetadata), which is what lets TestBed recompile it at run time.
@Component({
  selector: 'lab-greeting',
  template: `<p>AOT template</p>`,
})
class Greeting {}

describe('Section 7: AOT versus JIT', () => {
  it('Section 7: the test runtime has the JIT compiler, so a class decorated at run time gets a component definition', async () => {
    // Declared per run, so a retried test decorates a fresh class. Not decorated in source:
    // `Component(...)` is called at run time, as JIT-era code did.
    class RuntimeBadge {
      readonly label = signal('jit');
    }
    Component({
      selector: 'lab-runtime-badge',
      template: `<p [title]="label()">{{ label() }}</p>`,
    })(RuntimeBadge);

    // The definition is built on first access by @angular/compiler, which the unit-test builder loads.
    expect(reflectComponentType(RuntimeBadge)?.selector).toBe('lab-runtime-badge');

    const fixture = TestBed.createComponent(RuntimeBadge);
    await fixture.whenStable();
    const p = (fixture.nativeElement as HTMLElement).querySelector('p');
    expect(p?.textContent).toBe('jit');
    expect(p?.getAttribute('title')).toBe('jit');
  });

  it('Section 7: overrideTemplate recompiles a component at run time', async () => {
    TestBed.overrideTemplate(Greeting, `<p>JIT template</p>`);

    const fixture = TestBed.createComponent(Greeting);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBe('JIT template');
  });
});
