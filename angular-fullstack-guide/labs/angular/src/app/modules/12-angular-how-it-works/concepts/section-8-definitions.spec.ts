import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Counter } from './counter';

// The fields of the private ɵcmp definition these tests read (shape from ɵɵdefineComponent in
// @angular/core 22.2.1). Application code reads reflectComponentType instead; the lab peeks to show
// what the compiler produced.
interface ComponentDefinition {
  selectors: unknown[][];
  decls: number;
  vars: number;
  template: (rf: number, ctx: unknown) => void;
  onPush: boolean;
  inputs: Record<string, [string, number, unknown]>;
  dependencies: unknown[] | null;
}

// InputFlags.SignalBased in @angular/core 22.2.1.
const SIGNAL_BASED = 1;

function definitionOf(type: object): ComponentDefinition {
  return (type as { ɵcmp: ComponentDefinition }).ɵcmp;
}

@Component({
  selector: 'lab-eager-badge',
  template: `<span>eager</span>`,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class EagerBadge {}

describe('Section 8: what the compiler emits', () => {
  it('Section 8: the compiled component carries selectors, decls, vars and a template function', () => {
    const def = definitionOf(Counter);

    expect(def.selectors).toEqual([['lab-counter']]);
    expect(def.decls).toBe(10);
    expect(def.vars).toBe(6);
    expect(typeof def.template).toBe('function');
  });

  it('Section 8: a component without changeDetection is OnPush in its definition and Eager turns it off', () => {
    expect(definitionOf(Counter).onPush).toBe(true);
    expect(definitionOf(EagerBadge).onPush).toBe(false);
  });

  it('Section 8: the signal input is flagged as signal-based in the definition and in reflectComponentType', () => {
    const [, flags] = definitionOf(Counter).inputs['label'];
    expect(flags & SIGNAL_BASED).toBe(SIGNAL_BASED);

    const input = reflectComponentType(Counter)?.inputs.find((i) => i.propName === 'label');
    expect(input?.isSignal).toBe(true);
  });

  it('Section 8: dependencies list the pipe the component imports', () => {
    expect(definitionOf(Counter).dependencies).toEqual([UpperCasePipe]);
  });

  it('Section 8: the template function source names the create and update instructions', () => {
    const source = definitionOf(Counter).template.toString();

    expect(source).toContain('ɵɵdomElementStart');
    expect(source).toContain('ɵɵadvance');
    expect(source).toContain('ɵɵtextInterpolate2');
  });

  it('Section 8: the update pass keeps the existing DOM nodes and updates their text in place', async () => {
    const fixture = TestBed.createComponent(Counter);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const heading = host.querySelector('h2');
    const paragraph = host.querySelector('p');
    expect(heading?.textContent).toBe('COUNT: 0');

    host.querySelector('button')?.click();
    await fixture.whenStable();

    // The same DOM nodes are kept and their text updated in place: no tree is rebuilt.
    expect(host.querySelector('h2')).toBe(heading);
    expect(heading?.textContent).toBe('COUNT: 1');
    expect(host.querySelector('p')).toBe(paragraph);
    expect(host.querySelectorAll('li')).toHaveLength(1);
  });
});
