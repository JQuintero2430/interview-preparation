import { Component } from '@angular/core';

/**
 * One page, three security contexts (Section 3): the same kind of hostile-looking value goes to an HTML binding,
 * a URL binding and a style binding. The payloads only count (`window.__m33Hits`); nothing here bypasses the sanitizer.
 */
@Component({
  selector: 'lab-m33-sanitize',
  template: `
    <h2>Sanitization by context</h2>
    <section aria-label="HTML context"><div [innerHTML]="html"></div></section>
    <section aria-label="URL context"><a [href]="profile">Profile</a></section>
    <section aria-label="Style context"><p [style.background-image]="background">Styled</p></section>
  `,
})
export class LabM33Sanitize {
  protected readonly html =
    '<b>hi</b><script>window.__m33Hits=1</script><i onclick="window.__m33Hits=1">x</i><p style="color:red" class="c" id="i">t</p>';
  protected readonly profile = 'javascript:window.__m33Hits=1';
  protected readonly background = 'url("javascript:window.__m33Hits=1")';
}
