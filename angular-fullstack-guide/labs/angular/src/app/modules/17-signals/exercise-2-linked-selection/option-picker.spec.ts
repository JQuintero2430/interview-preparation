import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { keepOrFirst, type Option, OptionPicker } from './option-picker';

const a: Option = { id: 'a', label: 'Alpha' };
const b: Option = { id: 'b', label: 'Beta' };
const c: Option = { id: 'c', label: 'Gamma' };

@Component({
  imports: [OptionPicker],
  template: `<lab-option-picker [options]="options()" />`,
})
class Host {
  readonly options = signal<readonly Option[]>([a, b, c]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const picker = fixture.debugElement.children[0]!.componentInstance as OptionPicker;
  const selectedText = () => (fixture.nativeElement as HTMLElement).querySelector('[data-testid="selected"]')!.textContent!.trim();
  return { fixture, picker, selectedText };
}

describe('E17.2 OptionPicker with linkedSignal', () => {
  it('selects the first option initially', async () => {
    const { selectedText } = await setup();
    expect(selectedText()).toBe('Alpha');
  });

  it('lets the user change the selection', async () => {
    const { fixture, picker, selectedText } = await setup();
    picker.select('b');
    await fixture.whenStable();
    expect(selectedText()).toBe('Beta');
  });

  it('keeps the selection when the new options still contain it', async () => {
    const { fixture, picker, selectedText } = await setup();
    picker.select('c');
    fixture.componentInstance.options.set([c, a]);
    await fixture.whenStable();
    expect(selectedText()).toBe('Gamma');
  });

  it('falls back to the first option when the selected one disappears', async () => {
    const { fixture, picker, selectedText } = await setup();
    picker.select('b');
    fixture.componentInstance.options.set([c, a]);
    await fixture.whenStable();
    expect(selectedText()).toBe('Gamma');
    expect(picker.selectedId()).toBe('c');
  });

  it('selects nothing when the list becomes empty', async () => {
    const { fixture, picker, selectedText } = await setup();
    fixture.componentInstance.options.set([]);
    await fixture.whenStable();
    expect(picker.selectedId()).toBeNull();
    expect(selectedText()).toBe('Nothing selected');
  });

  it('uses native buttons and marks exactly one as pressed', async () => {
    const { fixture } = await setup();
    const root = fixture.nativeElement as HTMLElement;
    const beta = Array.from(root.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Beta')!;
    beta.click(); // a native button also fires click on Enter/Space
    await fixture.whenStable();
    const pressed = root.querySelectorAll('button[aria-pressed="true"]');
    expect(pressed).toHaveLength(1);
    expect(pressed[0]!.textContent!.trim()).toBe('Beta');
  });

  it('keepOrFirst is a pure function that can be tested on its own', () => {
    expect(keepOrFirst([a, b])).toBe('a');
    expect(keepOrFirst([a, b], { source: [b], value: 'b' })).toBe('b');
    expect(keepOrFirst([a], { source: [b], value: 'b' })).toBe('a');
    expect(keepOrFirst([], { source: [a], value: 'a' })).toBeNull();
  });
});
