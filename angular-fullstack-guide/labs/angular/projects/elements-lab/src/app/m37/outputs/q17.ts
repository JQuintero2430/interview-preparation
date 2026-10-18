import { Component } from '@angular/core';

/** Q37.17 (browser half): a click handler throws, a timer callback throws, a promise rejects with a string nobody handles. */
@Component({
  selector: 'lab-m37-q17',
  template: `
    <h2>Error outputs lab</h2>
    <button type="button" (click)="throwInClick()">Q17 throw in click</button>
    <button type="button" (click)="throwInTimeout()">Q17 throw in setTimeout</button>
    <button type="button" (click)="rejectPromise()">Q17 reject a promise</button>
  `,
})
export class LabM37Q17 {
  protected throwInClick(): void {
    throw new Error('q17 click boom');
  }

  protected throwInTimeout(): void {
    setTimeout(() => {
      throw new Error('q17 timeout boom');
    });
  }

  protected rejectPromise(): void {
    void Promise.reject('q17 rejection reason');
  }
}
