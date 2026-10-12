import { Directive, TemplateRef, inject } from '@angular/core';

// Marks the ng-template that holds a panel's body; the panel renders it on demand.
@Directive({ selector: 'ng-template[labPanelBody]' })
export class PanelBody {
  readonly template = inject(TemplateRef);
}
