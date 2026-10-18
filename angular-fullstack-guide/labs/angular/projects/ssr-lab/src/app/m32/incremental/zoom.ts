import { Component, signal } from '@angular/core';

/** The inner block of a nested pair: it logs when its block hydrates and counts zoom clicks. */
@Component({
  selector: 'lab-m32-incremental-zoom',
  template: `<button type="button" (click)="zoom.set(zoom() + 1)">Zoom: {{ zoom() }}</button>`,
})
export class LabM32IncrementalZoom {
  protected readonly zoom = signal(0);

  constructor() {
    console.log('m32 incremental: zoom block hydrated');
  }
}
