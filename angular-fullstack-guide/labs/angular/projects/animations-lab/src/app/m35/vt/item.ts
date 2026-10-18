import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ViewTransitionLog } from '../../view-transition-log';
import { VT_ITEMS } from './list';

// Section 10: the detail page. Its title carries the name the list's card of the same item carries, so the browser
// morphs one into the other. With `?twin=1` a second element takes the same name: two elements with one name.
@Component({
  selector: 'lab-m35-vt-item',
  host: { 'data-m35-vt': '' },
  imports: [RouterLink],
  template: `
    <h1 class="m35-vt-title" [style.view-transition-name]="'card-' + id">{{ name }}</h1>
    @if (twin) {
      <p class="m35-vt-twin" [style.view-transition-name]="'card-' + id">
        A second element with the same name.
      </p>
    }
    <a routerLink="/m35/vt/list">Back to the list</a>
    <p data-testid="last-transition">{{ summary() }}</p>
  `,
  styles: `
    .m35-vt-title {
      display: inline-block;
      padding: 1rem 1.5rem;
      background: #bfdbfe;
    }
  `,
})
export class LabM35VtItem {
  private readonly log = inject(ViewTransitionLog);
  private readonly route = inject(ActivatedRoute).snapshot;
  protected readonly id = Number(this.route.paramMap.get('id'));
  protected readonly name = VT_ITEMS.find((item) => item.id === this.id)?.name ?? 'Unknown';
  protected readonly twin = this.route.queryParamMap.has('twin');

  protected summary(): string {
    const last = this.log.last();
    return last ? `${last.from} to ${last.to}, skipped: ${last.skipped}` : 'no transition yet';
  }
}
