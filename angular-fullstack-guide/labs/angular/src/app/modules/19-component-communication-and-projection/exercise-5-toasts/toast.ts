import { Component, OnDestroy, input, output } from '@angular/core';

// Lets the spec count live toasts; a real toast would not carry it.
export const toastLog = { created: 0, destroyed: 0 };

@Component({
  selector: 'lab-m19-toast',
  template: `
    <span class="message">{{ message() }}</span>
    <div class="content"><ng-content /></div>
    <button type="button" class="close" (click)="dismissed.emit()">close</button>
  `,
})
export class Toast implements OnDestroy {
  readonly message = input.required<string>();
  readonly dismissed = output<void>();

  constructor() {
    toastLog.created++;
  }

  ngOnDestroy(): void {
    toastLog.destroyed++;
  }
}
