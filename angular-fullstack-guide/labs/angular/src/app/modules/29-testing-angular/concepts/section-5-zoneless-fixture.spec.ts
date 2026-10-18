import { ChangeDetectorRef, Component, input, signal } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m29-greeting',
  template: '<p>{{ name() }}</p><b>x</b>',
})
class LabM29Greeting {
  readonly name = input('none');
}

// The default change detection strategy is OnPush: only a signal read, an input or markForCheck refreshes the view.
@Component({
  selector: 'lab-m29-pair',
  template: '<p>{{ plain }}|{{ sig() }}</p>',
})
class LabM29Pair {
  plain = 'a';
  readonly sig = signal('a');
}

const AUTO_DETECT_OFF = 'Cannot set autoDetect to false with zoneless change detection.';

describe('Section 5: zoneless fixtures', () => {
  it('Section 5: the DOM is empty of bindings until the fixture is stable', async () => {
    const fixture = TestBed.createComponent(LabM29Greeting);
    fixture.componentRef.setInput('name', 'Ada');

    expect(fixture.nativeElement.textContent).toBe('x');

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Adax');
  });

  it('Section 5: TestBed.tick renders synchronously', () => {
    const fixture = TestBed.createComponent(LabM29Greeting);
    fixture.componentRef.setInput('name', 'Ada');

    expect(fixture.nativeElement.textContent).toBe('x');

    TestBed.tick();

    expect(fixture.nativeElement.textContent).toBe('Adax');
  });

  it('Section 5: a plain field write is not rendered until the view is marked', async () => {
    const fixture = TestBed.createComponent(LabM29Pair);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    fixture.componentInstance.plain = 'b';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('b|a');
  });

  it('Section 5: a signal write is rendered after whenStable', async () => {
    const fixture = TestBed.createComponent(LabM29Pair);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('a|a');

    fixture.componentInstance.sig.set('c');
    expect(fixture.nativeElement.textContent).toBe('a|a');

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('a|c');
  });

  it('Section 5: autoDetectChanges(false) throws in a zoneless test', () => {
    const fixture = TestBed.createComponent(LabM29Greeting);

    // Deliberate use of the deprecated boolean overload: the test asserts what it throws.
    expect(() => fixture.autoDetectChanges(false)).toThrow(AUTO_DETECT_OFF);
  });

  it('Section 5: whenStable resolves false when nothing is pending', async () => {
    const fixture = TestBed.createComponent(LabM29Greeting);
    await fixture.whenStable();
    expect(fixture.isStable()).toBe(true);

    expect(await fixture.whenStable()).toBe(false);
  });

  it('Section 5: TestBed.flushEffects still exists and runs TestBed.tick', async () => {
    const fixture = TestBed.createComponent(LabM29Pair);
    await fixture.whenStable();
    fixture.componentInstance.sig.set('c');
    expect(fixture.nativeElement.textContent).toBe('a|a');
    // getTestBed() is the instance whose tick() the static TestBed.flushEffects() reaches.
    const tick = vi.spyOn(getTestBed(), 'tick');

    try {
      expect(typeof TestBed.flushEffects).toBe('function');
      // Deliberate use of a deprecated member: the test shows it is deprecated, not removed.
      TestBed.flushEffects();

      expect(tick).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.textContent).toBe('a|c');
    } finally {
      tick.mockRestore();
    }
  });
});
