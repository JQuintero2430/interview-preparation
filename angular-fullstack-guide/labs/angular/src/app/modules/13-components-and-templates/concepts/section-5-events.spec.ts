import { Component, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountStepper, ManualParent, PlainParent, SignalParent } from './two-way-pair';

// Key filters on one input: each handler records its own name.
@Component({
  selector: 'lab-key-filters',
  template: `
    <input
      id="field"
      (keydown.enter)="ran.push('enter')"
      (keydown.shift.enter)="ran.push('shiftEnter')"
      (keydown.code.keya)="ran.push('codeA')"
      (keyup.esc)="ran.push('escape')"
    />
  `,
})
class KeyFilters {
  readonly ran: string[] = [];
}

// Modifiers may come in any order but the key must be last; any other name never matches.
@Component({
  selector: 'lab-key-order',
  template: `
    <input
      id="field"
      (keydown.control.shift.enter)="ran.push('controlShiftEnter')"
      (keydown.shift.control.enter)="ran.push('shiftControlEnter')"
      (keydown.enter.shift)="ran.push('enterShift')"
      (keydown.foo.enter)="ran.push('foo')"
    />
  `,
})
class KeyOrder {
  readonly ran: string[] = [];
}

// A handler that returns false, a statement that is false, and one that returns nothing.
@Component({
  selector: 'lab-false-handlers',
  template: `
    <a id="returns-false" href="#top" (click)="falseResult()">a</a>
    <a id="statement-false" href="#top" (click)="false">b</a>
    <a id="returns-nothing" href="#top" (click)="noResult()">c</a>
  `,
})
class FalseHandlers {
  falseResult(): boolean {
    return false;
  }
  noResult(): void {}
}

// Events of the DOM and of an output reach the statement as `$event`.
@Component({
  selector: 'lab-picker',
  template: `<button type="button" (click)="picked.emit(7)">pick</button>`,
})
class Picker {
  readonly picked = output<number>();
}

@Component({
  selector: 'lab-event-values',
  imports: [Picker],
  template: `
    <input id="field" (input)="onInput($event)" />
    <div id="outer" (click)="onOuter($event)"><span id="inner">x</span></div>
    <lab-picker (picked)="values.push($event)" />
    <button id="statements" type="button" (click)="clicks += 1; note('clicked')">s</button>
  `,
})
class EventValues {
  readonly values: number[] = [];
  readonly notes: string[] = [];
  clicks = 0;
  inputEvent: Event | undefined;
  outerTarget: EventTarget | null = null;
  outerCurrentTarget: EventTarget | null = null;
  onInput(event: Event): void {
    this.inputEvent = event;
  }
  onOuter(event: Event): void {
    this.outerTarget = event.target;
    this.outerCurrentTarget = event.currentTarget;
  }
  note(text: string): void {
    this.notes.push(text);
  }
}

// The two halves of [(count)] written out: a property binding and a listener.
@Component({
  selector: 'lab-hand-written-parent',
  imports: [CountStepper],
  template: `<lab-count-stepper [count]="total()" (countChange)="total.set($event)" />`,
})
class HandWrittenParent {
  readonly total = signal(0);
}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function el(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element for ${selector}`);
  }
  return found;
}

function key(target: HTMLElement, type: 'keydown' | 'keyup', init: KeyboardEventInit): void {
  target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
}

describe('Section 5: event binding and two-way binding', () => {
  it('Section 5: key filters match the exact set of modifiers', () => {
    const fixture = mount(KeyFilters);
    const field = el(fixture.nativeElement, '#field');
    const ran = fixture.componentInstance.ran;
    const press = (init: KeyboardEventInit) => {
      ran.length = 0;
      key(field, 'keydown', init);
      return [...ran];
    };

    expect(press({ key: 'Enter' })).toEqual(['enter']);
    expect(press({ key: 'Enter', shiftKey: true })).toEqual(['shiftEnter']);
    expect(press({ key: 'Enter', ctrlKey: true })).toEqual([]);
    expect(press({ key: 'Enter', shiftKey: true, ctrlKey: true })).toEqual([]);
    expect(press({ key: 'a', code: 'KeyA' })).toEqual(['codeA']);
    expect(press({ key: 'q', code: 'KeyA' })).toEqual(['codeA']);
    expect(press({ key: 'a', code: 'KeyB' })).toEqual([]);

    ran.length = 0;
    key(field, 'keyup', { key: 'Escape' });
    expect(ran).toEqual(['escape']);
  });

  it('Section 5: modifier order in a key filter does not matter but the key must come last', () => {
    const fixture = mount(KeyOrder);
    const field = el(fixture.nativeElement, '#field');

    key(field, 'keydown', { key: 'Enter', shiftKey: true, ctrlKey: true });
    key(field, 'keydown', { key: 'Enter', shiftKey: true });
    key(field, 'keydown', { key: 'Shift', shiftKey: true });
    expect(fixture.componentInstance.ran).toEqual(['controlShiftEnter', 'shiftControlEnter']);
  });

  it('Section 5: a handler that returns false calls preventDefault', () => {
    const root: HTMLElement = mount(FalseHandlers).nativeElement;
    const click = (selector: string) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      el(root, selector).dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(click('#returns-false')).toBe(true);
    expect(click('#statement-false')).toBe(true);
    expect(click('#returns-nothing')).toBe(false);
  });

  it('Section 5: event handlers receive the native event', () => {
    const fixture = mount(EventValues);
    const root: HTMLElement = fixture.nativeElement;
    const instance = fixture.componentInstance;

    const field = el(root, '#field');
    field.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(instance.inputEvent instanceof InputEvent).toBe(true);
    expect(instance.inputEvent?.target).toBe(field);

    el(root, '#inner').click();
    expect(instance.outerTarget).toBe(el(root, '#inner'));
    expect(instance.outerCurrentTarget).toBe(el(root, '#outer'));
  });

  it('Section 5: an output listener receives the emitted value as $event', () => {
    const fixture = mount(EventValues);
    el(fixture.nativeElement, 'lab-picker button').click();
    expect(fixture.componentInstance.values).toEqual([7]);
  });

  it('Section 5: a listener statement can assign and call', () => {
    const fixture = mount(EventValues);
    el(fixture.nativeElement, '#statements').click();
    el(fixture.nativeElement, '#statements').click();
    expect(fixture.componentInstance.clicks).toBe(2);
    expect(fixture.componentInstance.notes).toEqual(['clicked', 'clicked']);
  });

  it('Section 5: a two-way binding writes the child value back into the parent signal', async () => {
    const fixture = mount(SignalParent);
    const root: HTMLElement = fixture.nativeElement;
    const text = () => ({
      child: el(root, 'lab-count-stepper button').textContent,
      parent: el(root, 'output').textContent,
    });

    expect(text()).toEqual({ child: '0', parent: '0' });

    el(root, 'lab-count-stepper button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.total()).toBe(1);
    expect(text()).toEqual({ child: '1', parent: '1' });

    fixture.componentInstance.total.set(5);
    await fixture.whenStable();
    expect(text()).toEqual({ child: '5', parent: '5' });
  });

  it('Section 5: a two-way binding to a plain parent property assigns it', async () => {
    const fixture = mount(PlainParent);
    const button = el(fixture.nativeElement, 'lab-count-stepper button');

    button.click();
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.total).toBe(2);
  });

  it('Section 5: an input plus an output named xChange works with [(x)] like model()', async () => {
    const fixture = mount(ManualParent);
    const root: HTMLElement = fixture.nativeElement;

    el(root, 'lab-manual-stepper button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.total()).toBe(1);
    expect(el(root, 'lab-manual-stepper button').textContent).toBe('1');
    expect(el(root, 'output').textContent).toBe('1');
  });

  it('Section 5: [count] plus (countChange) written by hand behaves like [(count)]', async () => {
    const fixture = mount(HandWrittenParent);
    const button = el(fixture.nativeElement, 'lab-count-stepper button');

    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.total()).toBe(1);

    fixture.componentInstance.total.set(4);
    await fixture.whenStable();
    expect(button.textContent).toBe('4');
  });
});
