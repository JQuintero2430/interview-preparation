import { Component } from '@angular/core';

@Component({
  selector: 'lab-m35-instructions',
  // Top level on purpose: an @if body compiles to a separate template function.
  template: `<p animate.leave="m35-out">Class form</p>
    <p (animate.leave)="leave()">Function form</p>`,
})
class LabM35Instructions {
  leave(): void {
    // The callback body does not matter here: only the compiled template is read.
  }
}

/** The source of a component's compiled template function, read from its definition (ɵcmp). */
function templateSource(component: object): string {
  const definition: unknown = Reflect.get(component, 'ɵcmp');
  if (typeof definition !== 'object' || definition === null || !('template' in definition))
    return '';
  const template = definition.template;
  return typeof template === 'function' ? template.toString() : '';
}

// Each animate.* attribute compiles to an instruction call in the template function (@angular/compiler 22.2.1).
// ng test builds in development mode, which keeps the instruction names readable.
describe('Section 12: instructions', () => {
  it('Section 12: the compiled template calls the animate instructions', () => {
    const source = templateSource(LabM35Instructions);
    expect(source).toContain('ɵɵanimateLeave(');
    expect(source).toContain('ɵɵanimateLeaveListener(');
  });
});
