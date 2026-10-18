import { Component, input, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Listbox, Option } from '@angular/aria/listbox';
import { ListboxHarness } from '@angular/aria/listbox/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

interface Fruit {
  readonly value: string;
  readonly label: string;
}

const FRUITS: readonly Fruit[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

type FocusMode = 'roving' | 'activedescendant';
type SelectionMode = 'explicit' | 'follow';

/** A plain list made into a WAI-ARIA listbox by two directives; the modes are the directive's own defaults unless a test sets them. */
@Component({
  selector: 'lab-m36-fruit-listbox',
  imports: [Listbox, Option],
  template: `
    <ul ngListbox aria-label="Fruit" [focusMode]="focusMode()" [selectionMode]="selectionMode()" [(value)]="selected">
      @for (fruit of fruits; track fruit.value) {
        <li ngOption [value]="fruit.value" [label]="fruit.label">{{ fruit.label }}</li>
      }
    </ul>
  `,
})
class LabM36FruitListbox {
  readonly focusMode = input<FocusMode>('roving');
  readonly selectionMode = input<SelectionMode>('follow');
  readonly selected = signal<string[]>([]);
  protected readonly fruits = FRUITS;
}

async function renderListbox(focusMode: FocusMode = 'roving', selectionMode: SelectionMode = 'follow'): Promise<ComponentFixture<LabM36FruitListbox>> {
  const fixture = TestBed.createComponent(LabM36FruitListbox);
  fixture.componentRef.setInput('focusMode', focusMode);
  fixture.componentRef.setInput('selectionMode', selectionMode);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function parts(fixture: ComponentFixture<LabM36FruitListbox>): { list: HTMLElement; options: HTMLElement[] } {
  const root: HTMLElement = fixture.nativeElement;
  const list = root.querySelector('ul');
  if (!list) throw new Error('no listbox rendered');
  return { list, options: Array.from(list.querySelectorAll('li')) };
}

/** The Aria keyboard manager matches on `KeyboardEvent.key`; the event bubbles from the target to the listbox's host listener. */
function press(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function attributeOf(elements: HTMLElement[], name: string): (string | null)[] {
  return elements.map((element) => element.getAttribute(name));
}

describe('Section 11: Angular Aria listbox', () => {
  it('Section 11: ngListbox sets the listbox and option roles on plain elements', async () => {
    const fixture = await renderListbox();
    const { list, options } = parts(fixture);

    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-orientation')).toBe('vertical');
    expect(list.getAttribute('aria-multiselectable')).toBe('false');
    expect(attributeOf(options, 'role')).toEqual(['option', 'option', 'option']);
    // Each option gets a generated id, which aria-activedescendant can point at.
    for (const option of options) expect(option.id).toMatch(/^ng-option-/);

    // The defaults are roving focus and follow selection: with nothing bound, the first option is selected after the first render.
    expect(fixture.componentInstance.selected()).toEqual(['apple']);
    expect(attributeOf(options, 'aria-selected')).toEqual(['true', 'false', 'false']);
  });

  it('Section 11: in activedescendant mode focus stays on the listbox and aria-activedescendant moves', async () => {
    const fixture = await renderListbox('activedescendant', 'explicit');
    const { list, options } = parts(fixture);

    // The listbox is the one tab stop; no option is.
    expect(list.getAttribute('tabindex')).toBe('0');
    expect(attributeOf(options, 'tabindex')).toEqual(['-1', '-1', '-1']);
    expect(list.getAttribute('aria-activedescendant')).toBe(options[0]?.id);

    list.focus();
    press(list, 'ArrowDown');
    await fixture.whenStable();
    expect(list.getAttribute('aria-activedescendant')).toBe(options[1]?.id);
    expect(document.activeElement).toBe(list);
    // Explicit selection: moving selects nothing.
    expect(fixture.componentInstance.selected()).toEqual([]);
    expect(attributeOf(options, 'aria-selected')).toEqual(['false', 'false', 'false']);
  });

  it('Section 11: in roving mode the active option has tabindex 0 and the others -1', async () => {
    const fixture = await renderListbox('roving', 'explicit');
    const { list, options } = parts(fixture);
    const [first, second, third] = options;
    if (!first || !second || !third) throw new Error('three options expected');

    // The listbox leaves the tab sequence and sets no aria-activedescendant.
    expect(list.getAttribute('tabindex')).toBe('-1');
    expect(list.getAttribute('aria-activedescendant')).toBeNull();
    expect(attributeOf(options, 'tabindex')).toEqual(['0', '-1', '-1']);

    // ArrowDown moves DOM focus to the next option and moves the 0 with it.
    first.focus();
    press(first, 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(second);
    expect(attributeOf(options, 'tabindex')).toEqual(['-1', '0', '-1']);

    // End goes to the last option; ArrowDown there wraps to the first (wrap is on by default).
    press(second, 'End');
    await fixture.whenStable();
    expect(document.activeElement).toBe(third);
    expect(attributeOf(options, 'tabindex')).toEqual(['-1', '-1', '0']);
    press(third, 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(first);
    expect(attributeOf(options, 'tabindex')).toEqual(['0', '-1', '-1']);
  });

  it('Section 11: Space selects in explicit mode and updates the value model', async () => {
    const fixture = await renderListbox('roving', 'explicit');
    const { options } = parts(fixture);
    const [first, second] = options;
    if (!first || !second) throw new Error('options expected');

    first.focus();
    press(first, 'ArrowDown');
    press(second, ' ');
    await fixture.whenStable();
    // The model is an array of option values; the bound signal receives it through [(value)].
    expect(fixture.componentInstance.selected()).toEqual(['banana']);
    expect(attributeOf(options, 'aria-selected')).toEqual(['false', 'true', 'false']);

    // Space on the selected option toggles it off.
    press(second, ' ');
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual([]);

    // The other direction: writing the parent's signal selects the matching option.
    fixture.componentInstance.selected.set(['cherry']);
    await fixture.whenStable();
    expect(attributeOf(options, 'aria-selected')).toEqual(['false', 'false', 'true']);
  });

  it('Section 11: ListboxHarness reads the selected options', async () => {
    const fixture = await renderListbox('roving', 'explicit');
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const listbox = await loader.getHarness(ListboxHarness);

    expect(await listbox.isMulti()).toBe(false);
    expect(await listbox.getOrientation()).toBe('vertical');
    const options = await listbox.getOptions();
    expect(options).toHaveLength(3);

    // A click in explicit single selection toggles the clicked option.
    await options[2]?.click();
    const selected = await listbox.getOptions({ selected: true });
    expect(await Promise.all(selected.map((option) => option.getText()))).toEqual(['Cherry']);
    expect(fixture.componentInstance.selected()).toEqual(['cherry']);
  });
});
