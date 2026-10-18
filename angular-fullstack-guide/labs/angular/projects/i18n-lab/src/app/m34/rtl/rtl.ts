import { Component } from '@angular/core';

// Section 11 of module 34: one page measured in the `en-US` and `ar` builds. Each frame is a fixed-width flex row,
// so a physical and a logical margin can be compared by where the box lands; the user name and the phone number show
// what the bidi algorithm does to neutral characters at the edge of a run.
@Component({
  selector: 'lab-m34-rtl',
  template: `
    <div class="frame" data-testid="physical-frame"><span class="box physical" data-testid="physical-box"></span></div>
    <div class="frame" data-testid="logical-frame"><span class="box logical" data-testid="logical-box"></span></div>
    <p class="frame start" data-testid="start" i18n="@@m34.rtl.start">Aligned to the start</p>
    <p data-testid="plain" i18n="@@m34.rtl.arrived">{{ name }} just arrived</p>
    <p data-testid="isolated" i18n="@@m34.rtl.arrivedIsolated"><bdi>{{ name }}</bdi> just arrived</p>
    <p data-testid="phone-plain">{{ phone }}</p>
    <p data-testid="phone-ltr" dir="ltr">{{ phone }}</p>
  `,
  styles: `
    .frame { display: flex; width: 300px; }
    .box { width: 100px; height: 20px; background: #888; }
    .physical { margin-left: 16px; }
    .logical { margin-inline-start: 16px; }
    .start { text-align: start; }
  `,
})
export class LabM34Rtl {
  protected readonly name = 'Ana!';
  protected readonly phone = '+57 300 123 4567';
}
