import { Component, inject, RESPONSE_INIT } from '@angular/core';

/** Sets the response status while the server renders; the token is `null` in the browser. */
@Component({
  selector: 'lab-m32-platform-not-found',
  template: `<h2>Not found</h2><p>This page does not exist.</p>`,
})
export class LabM32PlatformNotFound {
  constructor() {
    const response = inject(RESPONSE_INIT);
    if (response) response.status = 404;
  }
}
