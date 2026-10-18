import { Component, input, inputBinding, output, outputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'lab-m29-greet',
  template: '<p>{{ name() }}</p><button type="button" (click)="hit.emit(name())">x</button>',
})
class LabM29Greet {
  readonly name = input('none');
  readonly hit = output<string>();
}

@Component({
  selector: 'lab-m29-card',
  template:
    '<div class="card" (click)="log.push(\'card\')"><button type="button" (click)="log.push(\'button\')">go</button></div>',
})
class LabM29Card {
  readonly log: string[] = [];
}

@Component({
  selector: 'lab-m29-toolbar',
  template:
    '<button type="button" class="btn-primary" aria-label="Save draft" (click)="act.emit(\'save\')">S</button>' +
    '<button type="button" class="btn-danger" (click)="act.emit(\'delete\')">Delete</button>',
})
class LabM29Toolbar {
  readonly act = output<string>();
}

// A simplified accessible name: the aria-label when there is one, else the trimmed text content.
function findButtonByName(root: HTMLElement, name: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find(
    (button) => (button.getAttribute('aria-label') ?? button.textContent?.trim()) === name,
  );
}

describe('Section 6: component tests', () => {
  it('Section 6: setInput updates a signal input after whenStable', async () => {
    const fixture = TestBed.createComponent(LabM29Greet);
    fixture.componentRef.setInput('name', 'Ada');

    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('p')).nativeElement.textContent).toBe('Ada');
    expect(fixture.componentInstance.name()).toBe('Ada');
  });

  it('Section 6: bindings keep a signal input in sync after TestBed.tick', async () => {
    const name = signal('Bo');
    const got: string[] = [];
    const fixture = TestBed.createComponent(LabM29Greet, {
      bindings: [inputBinding('name', name), outputBinding<string>('hit', (value) => got.push(value))],
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('Box');

    name.set('Cy');
    expect(fixture.nativeElement.textContent).toBe('Box');

    TestBed.tick();
    expect(fixture.nativeElement.textContent).toBe('Cyx');

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(got).toEqual(['Cy']);
  });

  it('Section 6: an output is observed by subscribing to the OutputEmitterRef', async () => {
    const fixture = TestBed.createComponent(LabM29Greet);
    const got: string[] = [];
    fixture.componentInstance.hit.subscribe((value) => got.push(value));
    fixture.componentRef.setInput('name', 'Ada');
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(got).toEqual(['Ada']);
  });

  it('Section 6: a signal input cannot be set from the test', () => {
    const fixture = TestBed.createComponent(LabM29Greet);

    const attempt = () =>
      // @ts-expect-error an InputSignal has no set method, so the compiler rejects the call
      fixture.componentInstance.name.set('Ada');

    expect(attempt).toThrow(TypeError);
    expect(fixture.componentInstance.name()).toBe('none');
  });

  it('Section 6: triggerEventHandler runs only the listener on that element', async () => {
    const fixture = TestBed.createComponent(LabM29Card);
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button')).triggerEventHandler('click');

    expect(fixture.componentInstance.log).toEqual(['button']);
  });

  it('Section 6: a native click bubbles to the parent listener', async () => {
    const fixture = TestBed.createComponent(LabM29Card);
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(fixture.componentInstance.log).toEqual(['button', 'card']);
  });

  it('Section 6: a button is found by its accessible name', async () => {
    const fixture = TestBed.createComponent(LabM29Toolbar);
    const got: string[] = [];
    fixture.componentInstance.act.subscribe((value) => got.push(value));
    await fixture.whenStable();

    const save = findButtonByName(fixture.nativeElement, 'Save draft');
    const remove = findButtonByName(fixture.nativeElement, 'Delete');
    expect(findButtonByName(fixture.nativeElement, 'S')).toBeUndefined();
    save?.click();
    remove?.click();

    expect(save?.classList.contains('btn-primary')).toBe(true);
    expect(got).toEqual(['save', 'delete']);
  });
});
