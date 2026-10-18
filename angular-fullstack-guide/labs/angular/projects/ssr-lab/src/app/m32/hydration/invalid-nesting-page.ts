import { Component } from '@angular/core';

/** Renders a `<div>`: valid on its own, invalid where the page places it (inside a `<p>`). */
@Component({
  selector: 'lab-m32-note-box',
  template: `<div>Box content</div>`,
})
export class LabM32NoteBox {}

@Component({
  selector: 'lab-m32-hydration-invalid-nesting',
  imports: [LabM32NoteBox],
  template: `
    <h2>Hydration: invalid nesting</h2>
    <p>Intro <lab-m32-note-box /></p>
  `,
})
export class LabM32HydrationInvalidNesting {}
