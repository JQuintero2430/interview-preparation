import { Component } from '@angular/core';

/** The outer block of a nested pair; it logs when the browser creates it, that is, when its block hydrates. */
@Component({
  selector: 'lab-m32-incremental-gallery',
  template: `<p>Gallery: 4 photos.</p>`,
})
export class LabM32IncrementalGallery {
  constructor() {
    console.log('m32 incremental: gallery block hydrated');
  }
}
