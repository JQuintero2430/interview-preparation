import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Section 6: a value trusted with `bypassSecurityTrustHtml`. Angular hands it to the sink through its
 * `angular#unsafe-bypass` policy, which exists only when the page's `trusted-types` header allows that name.
 */
@Component({
  selector: 'lab-m33-tt-bypass',
  template: `
    <h2>Bypassed HTML</h2>
    <section aria-label="Bypassed binding"><div [innerHTML]="trusted"></div></section>
  `,
})
export class LabM33TtBypass {
  protected readonly trusted = inject(DomSanitizer).bypassSecurityTrustHtml('<b>Bypassed</b>');
}
