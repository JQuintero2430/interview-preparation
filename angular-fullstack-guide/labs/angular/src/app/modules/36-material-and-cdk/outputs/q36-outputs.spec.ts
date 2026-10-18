import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { C, DOWN_ARROW, END } from '@angular/cdk/keycodes';
import { BreakpointObserver, Breakpoints, type BreakpointState } from '@angular/cdk/layout';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Listbox, Option } from '@angular/aria/listbox';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButton } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';

@Component({
  selector: 'lab-m36-q03-required-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError],
  template: `
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput required [formControl]="name" />
      <mat-error>Name is required</mat-error>
    </mat-form-field>
  `,
})
class LabM36Q03RequiredField {
  readonly name = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  selector: 'lab-m36-q21-buttons',
  imports: [MatButton],
  template: `
    <button matButton>Save</button>
    <button matButton>Cancel</button>
  `,
})
class LabM36Q21Buttons {}

@Component({
  selector: 'lab-m36-q23-listbox',
  imports: [Listbox, Option],
  template: `
    <ul ngListbox aria-label="Fruit" focusMode="activedescendant" selectionMode="explicit" [(value)]="selected">
      <li ngOption value="apple" label="Apple">Apple</li>
      <li ngOption value="banana" label="Banana">Banana</li>
      <li ngOption value="cherry" label="Cherry">Cherry</li>
    </ul>
  `,
})
class LabM36Q23Listbox {
  readonly selected = signal<string[]>([]);
}

/** A row for `FocusKeyManager`: type-ahead needs `getLabel`, and the default skip predicate reads `disabled`. */
class LabM36Row implements FocusableOption {
  constructor(
    readonly label: string,
    readonly disabled = false,
  ) {}

  focus(): void {}

  getLabel(): string {
    return this.label;
  }
}

function key(keyCode: number, character = ''): KeyboardEvent {
  return new KeyboardEvent('keydown', { keyCode, key: character });
}

describe('Q36 outputs', () => {
  it('Q36.03 a required matInput shows no error until touched, then the error, and aria-invalid stays absent while empty', async () => {
    const fixture = TestBed.createComponent(LabM36Q03RequiredField);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const field = root.querySelector('mat-form-field');
    const input = root.querySelector('input');
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };

    // Before any interaction: invalid but untouched, so the default matcher stays quiet.
    expect(fixture.componentInstance.name.invalid).toBe(true);
    expect(root.querySelector('mat-error')).toBeNull();
    expect(field?.classList.contains('mat-form-field-invalid')).toBe(false);
    expect(input?.hasAttribute('aria-invalid')).toBe(false); // `(empty && required) ? null : errorState`
    expect(input?.getAttribute('aria-required')).toBe('true');

    // After blur while empty: the error and the invalid class appear, yet aria-invalid is still absent.
    input?.dispatchEvent(new Event('blur'));
    await settle();
    const error = root.querySelector('mat-error');
    expect(error?.textContent).toBe('Name is required');
    expect(field?.classList.contains('mat-form-field-invalid')).toBe(true);
    expect(field?.classList.contains('ng-touched')).toBe(true);
    expect(input?.hasAttribute('aria-invalid')).toBe(false);
    expect(input?.getAttribute('aria-describedby')).toBe(error?.id);

    // After typing a valid value: no error, no invalid class, and aria-invalid is now the string "false".
    if (input) {
      input.value = 'Ada';
      input.dispatchEvent(new Event('input'));
    }
    await settle();
    expect(root.querySelector('mat-error')).toBeNull();
    expect(field?.classList.contains('mat-form-field-invalid')).toBe(false);
    expect(input?.getAttribute('aria-invalid')).toBe('false');
  });

  it('Q36.15 under jsdom Handset reports matches false for both queries, once, and never emits again', async () => {
    // jsdom has no matchMedia, so the CDK's MediaMatcher answers every query with its no-op fallback, which never matches and never fires a change.
    expect(typeof window.matchMedia).toBe('undefined');
    const observer = TestBed.inject(BreakpointObserver);
    const states: BreakpointState[] = [];
    observer.observe(Breakpoints.Handset).subscribe((state) => states.push(state));

    expect(states).toHaveLength(1);
    expect(states[0].matches).toBe(false);
    expect(Object.values(states[0].breakpoints)).toEqual([false, false]);
    expect(observer.isMatched(Breakpoints.Handset)).toBe(false);

    // One macrotask later (the observer's debounce is a zero-delay timer) there is still only the first emission.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(states).toHaveLength(1);
  });

  describe('Q36.18', () => {
    // rxjs `debounceTime` schedules with `setInterval` and compares `Date.now()` on each tick, so the clock must be faked too.
    beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] }));
    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('Q36.18 ArrowDown x3 gives 0, 1, 3; End 4; ArrowDown wraps to 0; typing c skips the disabled Cherry and lands on 4 once the fake timers run', () => {
      const rows = [
        new LabM36Row('Apple'),
        new LabM36Row('Banana'),
        new LabM36Row('Cherry', true),
        new LabM36Row('Date'),
        new LabM36Row('Cranberry'),
      ];
      const manager = new FocusKeyManager(rows).withWrap().withTypeAhead().withHomeAndEnd();
      expect(manager.activeItemIndex).toBe(-1);

      const down = () => manager.onKeydown(key(DOWN_ARROW));
      const seen: (number | null)[] = [];
      for (let step = 0; step < 3; step++) {
        down();
        seen.push(manager.activeItemIndex);
      }
      expect(seen).toEqual([0, 1, 3]); // index 2 is skipped by the default skip predicate (`disabled`)

      manager.onKeydown(key(END));
      expect(manager.activeItemIndex).toBe(4);

      down();
      expect(manager.activeItemIndex).toBe(0); // withWrap: past the last item comes the first

      // Typing is buffered: nothing moves until the debounce fires, and the fake timers fire it.
      manager.onKeydown(key(C, 'c'));
      expect(manager.isTyping()).toBe(true);
      expect(manager.activeItemIndex).toBe(0);
      vi.runOnlyPendingTimers();
      expect(manager.isTyping()).toBe(false);
      expect(manager.activeItemIndex).toBe(4); // Cherry (2) starts with "c" but is skipped; Cranberry (4) is next
      expect(manager.activeItem).toBe(rows[4]);
      manager.destroy();
    });

    it('Q36.18 without withHomeAndEnd the End key changes nothing, and without withWrap ArrowDown stops at the last item', () => {
      const rows = [new LabM36Row('Apple'), new LabM36Row('Banana'), new LabM36Row('Cherry')];
      const manager = new FocusKeyManager(rows);
      manager.setActiveItem(0);
      manager.onKeydown(key(END));
      expect(manager.activeItemIndex).toBe(0);
      manager.setActiveItem(2);
      manager.onKeydown(key(DOWN_ARROW));
      expect(manager.activeItemIndex).toBe(2);
    });
  });

  it('Q36.21 getHarness takes the first button, getAllHarnesses both, with({ text }) the match, and a miss is null or a rejection naming the query', async () => {
    const fixture = TestBed.createComponent(LabM36Q21Buttons);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    expect(await (await loader.getHarness(MatButtonHarness)).getText()).toBe('Save'); // first in DOM order
    expect(await (await loader.getHarnessOrNull(MatButtonHarness))?.getText()).toBe('Save');
    const all = await loader.getAllHarnesses(MatButtonHarness);
    expect(await Promise.all(all.map((button) => button.getText()))).toEqual(['Save', 'Cancel']);
    expect(await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).getText()).toBe('Cancel');

    const none = MatButtonHarness.with({ text: 'Missing' });
    expect(await loader.getHarnessOrNull(none)).toBeNull();
    expect(await loader.getAllHarnesses(none)).toEqual([]);
    expect(await loader.hasHarness(none)).toBe(false);

    const message = `Failed to find element matching one of the following queries:\n(${MatButtonHarness.name} with host element matching selector: "${MatButtonHarness.hostSelector}" satisfying the constraints: text = "Missing")`;
    await expect(loader.getHarness(none)).rejects.toHaveProperty('message', message);
  });

  it('Q36.23 in activedescendant and explicit mode ArrowDown moves aria-activedescendant to the second option without selecting, then Space selects it and value is [banana]', async () => {
    const fixture = TestBed.createComponent(LabM36Q23Listbox);
    fixture.detectChanges();
    await fixture.whenStable();
    const list: HTMLElement = fixture.nativeElement.querySelector('ul');
    const options: HTMLElement[] = Array.from(list.querySelectorAll('li'));
    const selectedStates = () => options.map((option) => option.getAttribute('aria-selected'));
    const press = (key: string) => list.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    expect(list.getAttribute('aria-activedescendant')).toBe(options[0]?.id);
    list.focus();
    press('ArrowDown');
    await fixture.whenStable();
    expect(list.getAttribute('aria-activedescendant')).toBe(options[1]?.id);
    expect(document.activeElement).toBe(list);
    expect(selectedStates()).toEqual(['false', 'false', 'false']);
    expect(fixture.componentInstance.selected()).toEqual([]);

    press(' ');
    await fixture.whenStable();
    expect(selectedStates()).toEqual(['false', 'true', 'false']);
    expect(fixture.componentInstance.selected()).toEqual(['banana']);
    expect(list.getAttribute('aria-activedescendant')).toBe(options[1]?.id);
  });
});
