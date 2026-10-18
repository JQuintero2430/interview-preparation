import { Component } from '@angular/core';

/** Section 10: what a user sees when `canMatch` refuses the admin route and the next route with that path matches. */
@Component({
  selector: 'lab-m33-guards-fallback',
  template: `<h2>Not available for your role</h2>`,
})
export class LabM33GuardsFallback {}
