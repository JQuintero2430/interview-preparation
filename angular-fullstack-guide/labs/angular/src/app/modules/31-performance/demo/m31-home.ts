import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

/** Landing page of the module-31 lab: the hero image is the page's largest element. */
@Component({
  selector: 'lab-m31-home',
  imports: [NgOptimizedImage],
  template: `
    <h1>Module 31 lab</h1>
    <p>Pages for the performance module run on the production build.</p>
    <img ngSrc="/m31/hero.svg" width="800" height="400" priority alt="Module 31 hero banner" />
  `,
})
export class LabM31Home {}
