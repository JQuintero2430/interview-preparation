import { Component, input } from '@angular/core';

// Styles from a file (styleUrl) plus a style element inside the template file.
@Component({
  selector: 'lab-styled-card',
  templateUrl: './styled-card.html',
  styleUrl: './styled-card.css',
  host: { '[style.--card-tone]': 'tone()' },
})
export class StyledCard {
  readonly heading = input('Card');
  readonly tone = input('teal');
}

// The same scoping with the styles written as a string in the metadata.
@Component({
  selector: 'lab-inline-card',
  template: `<h3 class="inline-title">Inline</h3>`,
  styles: `
    .inline-title {
      color: teal;
    }
  `,
})
export class InlineCard {}
