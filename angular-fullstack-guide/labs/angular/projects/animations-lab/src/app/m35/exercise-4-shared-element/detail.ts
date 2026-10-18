import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PRODUCTS, transitionName } from './products';

// Exercise 35.4: the detail page both variants share. Its header always carries the product's transition name, the
// one the clicked card carries on the list, so the browser morphs the card into the header and back.
@Component({
  selector: 'lab-m35-ex4-detail',
  host: { 'data-m35-ex4': '' },
  imports: [RouterLink],
  template: `
    <h1 class="m35-ex4-header" [style.view-transition-name]="name">
      {{ product?.name ?? 'Unknown' }}
    </h1>
    <a [routerLink]="base">Back to the products</a>
  `,
  styles: `
    .m35-ex4-header {
      display: inline-block;
      padding: 2rem 3rem;
      background: #bbf7d0;
    }
  `,
})
export class LabM35Ex4Detail {
  private readonly route = inject(ActivatedRoute).snapshot;
  private readonly id = Number(this.route.paramMap.get('id'));
  protected readonly product = PRODUCTS.find((product) => product.id === this.id);
  protected readonly name = transitionName(this.id);
  /** Set by the route's data: `/m35/ex4/a` or `/m35/ex4/b`. */
  protected readonly base = String(this.route.data['base']);
}
