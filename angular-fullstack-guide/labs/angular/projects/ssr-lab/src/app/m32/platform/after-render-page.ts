import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

/** Browser-only work goes into `afterNextRender`, and the document comes from `DOCUMENT`. */
@Component({
  selector: 'lab-m32-platform-after-render',
  template: `
    <h2>Platform: after render</h2>
    <p>Width: <output aria-label="Width">{{ width() }}</output></p>
  `,
})
export class LabM32PlatformAfterRender {
  private readonly document = inject(DOCUMENT);
  protected readonly width = signal('unknown');

  constructor() {
    afterNextRender(() => this.width.set(`${this.document.defaultView?.innerWidth}px`));
  }
}
