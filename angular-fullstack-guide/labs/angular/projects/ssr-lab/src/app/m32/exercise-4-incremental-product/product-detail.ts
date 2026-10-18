import { afterNextRender, Component, signal } from '@angular/core';
import { LabM32Ex4Footer } from './site-footer';
import { LabM32Ex4Recommendations } from './recommendations';
import { LabM32Ex4Reviews } from './reviews';

/** The solution: one `@defer` block per region, each with the hydrate trigger that fits it. */
@Component({
  selector: 'lab-m32-ex4-product-detail',
  imports: [LabM32Ex4Footer, LabM32Ex4Recommendations, LabM32Ex4Reviews],
  template: `
    <h2>Office chair</h2>
    <p>Page: <output aria-label="Page state">{{ state() }}</output></p>

    @defer (hydrate on interaction) {
      <section><lab-m32-ex4-reviews /></section>
    } @placeholder {
      <p>Reviews placeholder</p>
    }

    <p class="description">Mesh back, adjustable arms, five-year warranty.</p>

    @defer (hydrate on viewport) {
      <section><lab-m32-ex4-recommendations /></section>
    } @placeholder {
      <p>Recommendations placeholder</p>
    }

    @defer (hydrate never) {
      <footer><lab-m32-ex4-footer /></footer>
    }
  `,
  styles: `.description { min-height: 150vh; }`,
})
export class LabM32Ex4ProductDetail {
  /** "server" in the server HTML; "hydrated" once the page itself has hydrated in the browser. */
  protected readonly state = signal('server');

  constructor() {
    afterNextRender(() => this.state.set('hydrated'));
  }
}
