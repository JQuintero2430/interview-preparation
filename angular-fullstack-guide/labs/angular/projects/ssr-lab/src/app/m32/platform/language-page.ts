import { Component, inject, REQUEST } from '@angular/core';

/** Shows the request's `Accept-Language` header; with no request (prerendering, the browser) there is none. */
@Component({
  selector: 'lab-m32-platform-language',
  template: `<h2>Platform: language</h2><p>Accept-Language: <output aria-label="Language">{{ language }}</output></p>`,
})
export class LabM32PlatformLanguage {
  protected readonly language = inject(REQUEST)?.headers.get('accept-language') ?? 'no request';
}
