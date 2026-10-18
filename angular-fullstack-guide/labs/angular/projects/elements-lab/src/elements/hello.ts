import { Component, input, output } from '@angular/core';

/** `<m37-hello name="…">`: renders a greeting; the button emits `greeted` with the name. */
@Component({
  selector: 'lab-m37-hello',
  template: `
    <span data-testid="hello">Hello, {{ name() }}</span>
    <button type="button" (click)="greeted.emit(name())">Greet</button>
  `,
})
export class LabHelloElement {
  readonly name = input('world');
  readonly greeted = output<string>();
}
