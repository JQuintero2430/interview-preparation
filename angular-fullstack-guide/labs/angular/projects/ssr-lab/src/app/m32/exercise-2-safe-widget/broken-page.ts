import { Component } from '@angular/core';

/** The "before": both reads run while the component is created, so a server render of this page fails. */
@Component({
  selector: 'lab-m32-ex2-broken',
  template: `
    <h2>Widget: viewport and recent items</h2>
    <p>Width: <output aria-label="Width">{{ width }}</output></p>
    <p>Recent: <output aria-label="Recent">{{ recent }}</output></p>
  `,
})
export class LabM32Ex2Broken {
  protected readonly width = `${window.innerWidth}px`;
  protected readonly recent = localStorage.getItem('lab-m32-ex2-recent') ?? 'none';
}
