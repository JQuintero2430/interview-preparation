import { Component, input, signal } from '@angular/core';
import { StableLoader } from './stable-loader';

@Component({
  selector: 'lab-m21-e4-host',
  imports: [StableLoader],
  template: `@if (shown()) {
    @for (key of keys(); track key) {
      <lab-m21-e4-loader [key]="key" />
    }
  }`,
})
export class LoaderHost {
  readonly keys = input<readonly string[]>(['a']);
  readonly shown = signal(true);
}
