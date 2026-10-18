import { IMAGE_CONFIG, IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { labM31CdnLoader } from './image-hosts';

/** Two breakpoints instead of the sixteen defaults; each becomes one width in the `srcset`. */
const CUSTOM_BREAKPOINTS: readonly number[] = [300, 600];

/** A responsive image (`sizes` set, not `100vw`) whose `IMAGE_CONFIG` lists only the custom breakpoints. */
@Component({
  selector: 'lab-m31-custom-breakpoints-image',
  imports: [NgOptimizedImage],
  providers: [
    { provide: IMAGE_LOADER, useValue: labM31CdnLoader },
    // A copy, because the directive sorts the configured array in place.
    { provide: IMAGE_CONFIG, useValue: { breakpoints: [...CUSTOM_BREAKPOINTS] } },
  ],
  template: `<img ngSrc="photo.jpg" width="600" height="400" sizes="50vw" alt="Photo" />`,
})
class LabM31CustomBreakpointsImage {}

describe('Section 11: under the hood of NgOptimizedImage', () => {
  it('Section 11: a custom breakpoints list becomes the srcset widths', () => {
    const fixture = TestBed.createComponent(LabM31CustomBreakpointsImage);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('img')?.getAttribute('srcset')).toBe('cdn/photo.jpg?w=300 300w, cdn/photo.jpg?w=600 600w');
  });
});
