import { afterNextRender, Component, signal } from '@angular/core';
import { LabM32IncrementalFooter } from './site-footer';
import { LabM32IncrementalGallery } from './gallery';
import { LabM32IncrementalRelated } from './related';
import { LabM32IncrementalReviews } from './reviews';
import { LabM32IncrementalZoom } from './zoom';

/** A product page with three kinds of `@defer` block: regular, `hydrate on interaction` (also nested) and `hydrate never`. */
@Component({
  selector: 'lab-m32-incremental-product',
  imports: [
    LabM32IncrementalFooter,
    LabM32IncrementalGallery,
    LabM32IncrementalRelated,
    LabM32IncrementalReviews,
    LabM32IncrementalZoom,
  ],
  template: `
    <h2>Incremental hydration: desk chair</h2>
    <p>Page: <output aria-label="Page state">{{ state() }}</output></p>

    @defer (hydrate on interaction) {
      <section>
        <lab-m32-incremental-gallery />
        @defer (hydrate on interaction) {
          <div><lab-m32-incremental-zoom /></div>
        }
      </section>
    }

    @defer (hydrate on interaction) {
      <section><lab-m32-incremental-reviews /></section>
    } @placeholder {
      <p>Reviews placeholder</p>
    }

    @defer (on viewport) {
      <lab-m32-incremental-related />
    } @placeholder {
      <p>Related products placeholder</p>
    }

    @defer (hydrate never) {
      <footer><lab-m32-incremental-footer /></footer>
    }
  `,
})
export class LabM32IncrementalProduct {
  /** "server" in the server HTML; "hydrated" once the page itself has hydrated in the browser. */
  protected readonly state = signal('server');

  constructor() {
    afterNextRender(() => this.state.set('hydrated'));
  }
}
