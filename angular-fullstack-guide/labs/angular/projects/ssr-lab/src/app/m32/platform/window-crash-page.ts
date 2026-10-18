import { Component } from '@angular/core';

/** Reads `window` while the component is created, so a server render of this page fails. */
@Component({
  selector: 'lab-m32-platform-window-crash',
  template: `<h2>Platform: window width</h2><p>Width: {{ width }}</p>`,
})
export class LabM32PlatformWindowCrash {
  protected readonly width = window.innerWidth;
}
