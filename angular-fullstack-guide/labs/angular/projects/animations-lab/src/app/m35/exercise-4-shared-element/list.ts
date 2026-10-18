import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PRODUCTS } from './products';

// Exercise 35.4: the product list both variants share. The variant decides which card carries a transition name
// (`nameOf`); the list only binds it. The filter links go to `<base>/filtered`, a route whose data skips the transition.
@Component({
  selector: 'lab-m35-ex4-list',
  host: { 'data-m35-ex4': '' },
  imports: [RouterLink],
  template: `
    <h1>Exercise 35.4{{ variant() }}: products</h1>
    <ul class="m35-ex4-cards" aria-label="Products">
      @for (product of products(); track product.id) {
        <li>
          <a
            class="m35-ex4-card"
            [routerLink]="[base(), 'product', product.id]"
            [style.view-transition-name]="nameOf()(product.id)"
            [attr.data-product]="product.id"
            (click)="picked.emit(product.id)"
            >{{ product.name }}</a
          >
        </li>
      }
    </ul>
    <nav aria-label="Filters">
      <a [routerLink]="[base(), 'filtered']" [queryParams]="{ tag: 'hand' }">Filter: hand</a>
      <a [routerLink]="[base(), 'filtered']" [queryParams]="{ tag: 'power' }">Filter: power</a>
    </nav>
    <p>Showing: {{ tag() ?? 'all' }}</p>
  `,
  styles: `
    .m35-ex4-cards {
      display: flex;
      gap: 1rem;
      padding: 0;
      list-style: none;
    }

    .m35-ex4-card {
      display: block;
      padding: 1rem 1.5rem;
      background: #dcfce7;
    }
  `,
})
export class LabM35Ex4List {
  /** `a` or `b`, shown in the heading. */
  readonly variant = input.required<string>();
  /** The variant's root path, such as `/m35/ex4/a`. */
  readonly base = input.required<string>();
  /** The transition name of a card, or `null` for none. */
  readonly nameOf = input.required<(id: number) => string | null>();
  /** The id of the card the user clicked. */
  readonly picked = output<number>();

  protected readonly tag = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('tag'))),
    { requireSync: true },
  );

  protected products(): readonly (typeof PRODUCTS)[number][] {
    const tag = this.tag();
    return tag ? PRODUCTS.filter((product) => product.tag === tag) : PRODUCTS;
  }
}
