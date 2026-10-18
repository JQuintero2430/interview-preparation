import { Component } from '@angular/core';

/**
 * Section 5: a page with one component style, served under a strict Content Security Policy by
 * server/security/05-csp.mjs. Angular adds `styles` as a `<style>` element at run time and gives it the nonce
 * it read from the root element's `ngCspNonce` attribute (the `CSP_NONCE` default).
 */
@Component({
  selector: 'lab-m33-csp',
  template: `
    <h2>Content Security Policy</h2>
    <p class="styled">Styled by a component style</p>
  `,
  styles: `
    .styled {
      color: rgb(0, 128, 0);
    }
  `,
})
export class LabM33Csp {}
