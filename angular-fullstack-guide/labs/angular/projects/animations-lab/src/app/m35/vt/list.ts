import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ViewTransitionLog } from '../../view-transition-log';

/** The items both pages know: the list shows them as cards, the detail page shows one as its title. */
export const VT_ITEMS: readonly { id: number; name: string }[] = [
  { id: 1, name: 'Anvil' },
  { id: 2, name: 'Bellows' },
  { id: 3, name: 'Chisel' },
];

// Section 10: view transitions with the router. Each card carries its own view-transition-name, so the card of the
// clicked item morphs into the detail page's title. The route `m35/vt/filtered` loads this same page with
// `data: { skipViewTransition: true }`: its links change only the query string.
@Component({
  selector: 'lab-m35-vt-list',
  host: { 'data-m35-vt': '' },
  imports: [RouterLink],
  template: `
    <h1>Section 10: view transitions</h1>
    <ul class="m35-vt-cards">
      @for (item of items; track item.id) {
        <li>
          <a
            class="m35-vt-card"
            [routerLink]="['/m35/vt/item', item.id]"
            [style.view-transition-name]="'card-' + item.id"
            >{{ item.name }}</a
          >
        </li>
      }
    </ul>
    <nav aria-label="Filters">
      <a routerLink="/m35/vt/filtered" [queryParams]="{ tag: 'tools' }">Filter: tools</a>
      <a routerLink="/m35/vt/filtered" [queryParams]="{ tag: 'metal' }">Filter: metal</a>
      <a routerLink="/m35/vt/item/1" [queryParams]="{ twin: 1 }">Open item 1 with a twin</a>
    </nav>
    <p>Current filter: {{ tag() ?? 'none' }}</p>
    <p data-testid="last-transition">{{ summary() }}</p>
  `,
  styles: `
    .m35-vt-cards {
      display: flex;
      gap: 1rem;
      padding: 0;
      list-style: none;
    }

    .m35-vt-card {
      display: block;
      padding: 1rem 1.5rem;
      background: #dbeafe;
    }
  `,
})
export class LabM35VtList {
  private readonly log = inject(ViewTransitionLog);
  protected readonly items = VT_ITEMS;
  protected readonly tag = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('tag'))),
    { requireSync: true },
  );

  protected summary(): string {
    const last = this.log.last();
    return last ? `${last.from} to ${last.to}, skipped: ${last.skipped}` : 'no transition yet';
  }
}
