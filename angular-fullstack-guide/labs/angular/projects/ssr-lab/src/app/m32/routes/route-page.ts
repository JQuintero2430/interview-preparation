import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** One page served by several server routes; the route's `data.mode` names the server route that serves it. */
@Component({
  selector: 'lab-m32-routes-page',
  template: `
    <h2>Route page: {{ mode }}</h2>
    <p>Visit: {{ visit }}</p>
  `,
})
export class LabM32RoutesPage {
  private readonly route = inject(ActivatedRoute).snapshot;
  protected readonly mode = String(this.route.data['mode']);
  protected readonly visit = this.route.queryParamMap.get('visit') ?? 'none';
}
