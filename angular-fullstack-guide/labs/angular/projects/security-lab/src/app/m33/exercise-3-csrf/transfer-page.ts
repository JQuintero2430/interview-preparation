import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, InjectionToken, inject, signal } from '@angular/core';

/** The variant's API prefix (`/api/m33/ex3/a/` or `/b/`). Given by the route. */
export const LAB_M33_EX3_API = new InjectionToken<string>('LAB_M33_EX3_API');

/**
 * Exercise 33.3: a transfer form whose session lives in a cookie. `HttpClient` is the app's, with its default XSRF
 * support: the POST goes to a relative URL, so when an `XSRF-TOKEN` cookie exists the header is copied from it.
 */
@Component({
  selector: 'lab-m33-ex3-transfer',
  template: `
    <h2>Transfers</h2>
    <button type="button" (click)="signIn()">Sign in</button>
    <button type="button" (click)="transfer()">Transfer 10</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class LabM33Ex3Transfer {
  private readonly http = inject(HttpClient);
  private readonly api = inject(LAB_M33_EX3_API);
  protected readonly status = signal('Signed out');

  protected signIn(): void {
    this.http.post(`${this.api}login`, null).subscribe({
      next: () => this.status.set('Signed in'),
      error: () => this.status.set('Sign-in failed'),
    });
  }

  protected transfer(): void {
    this.http.post(`${this.api}transfer`, { amount: 10 }).subscribe({
      next: () => this.status.set('Transfer accepted'),
      error: (error: HttpErrorResponse) => this.status.set(`Transfer failed: ${error.status}`),
    });
  }
}
