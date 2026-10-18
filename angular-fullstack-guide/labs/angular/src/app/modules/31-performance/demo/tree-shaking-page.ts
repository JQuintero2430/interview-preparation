import { Component } from '@angular/core';
import { usedGreeting } from './tree-shaking/index';

/**
 * Tree-shaking lab page: it imports one name through the barrel and uses it, so the other
 * three exports of the barrel are unused and the production build decides which survive.
 */
@Component({
  selector: 'lab-m31-tree-shaking',
  template: `
    <h1>Tree-shaking lab</h1>
    <p>{{ greeting }}</p>
  `,
})
export class LabM31TreeShaking {
  protected readonly greeting = usedGreeting();
}
