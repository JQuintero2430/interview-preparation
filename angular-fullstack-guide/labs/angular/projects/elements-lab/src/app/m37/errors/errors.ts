import { Component } from '@angular/core';

/** Three ways to fail: in a listener Angular calls, in a timer callback, and in a promise nobody handles. */
@Component({
  selector: 'lab-m37-errors',
  template: `
    <h2>Errors lab</h2>
    <button type="button" (click)="throwInListener()">Throw in listener</button>
    <button type="button" (click)="throwInTimeout()">Throw in setTimeout</button>
    <button type="button" (click)="rejectPromise()">Reject a promise</button>
  `,
})
export class LabM37Errors {
  protected throwInListener(): void {
    throw new Error('m37 listener error');
  }

  protected throwInTimeout(): void {
    setTimeout(() => {
      throw new Error('m37 timeout error');
    });
  }

  protected rejectPromise(): void {
    void Promise.reject(new Error('m37 rejection reason'));
  }
}
