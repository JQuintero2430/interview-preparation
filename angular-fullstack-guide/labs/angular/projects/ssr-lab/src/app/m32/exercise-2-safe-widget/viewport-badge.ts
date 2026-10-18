import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

/** Shows the window width: `unknown` in the server HTML, the real width once the browser has rendered. */
@Component({
  selector: 'lab-m32-ex2-viewport-badge',
  template: `<p>Width: <output aria-label="Width">{{ width() }}</output></p>`,
})
export class LabM32Ex2ViewportBadge {
  private readonly document = inject(DOCUMENT);
  protected readonly width = signal('unknown');

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (view) this.width.set(`${view.innerWidth}px`);
    });
  }
}
