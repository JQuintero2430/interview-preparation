import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

/** What `GET /api/m33/csrf/xssi` answers after its `)]}',` prefix is stripped (server/security/09-csrf.mjs). */
export interface LabM33CsrfStatus {
  ok: boolean;
}

/**
 * Section 9: a bank page whose session lives in cookies. `HttpClient` is provided by the app with its default XSRF
 * support, so the "Transfer" POST (a relative URL) carries `X-XSRF-TOKEN` copied from the `XSRF-TOKEN` cookie.
 */
@Component({
  selector: 'lab-m33-csrf-bank',
  template: `
    <h2>Bank</h2>
    <button type="button" (click)="signIn()">Sign in</button>
    <button type="button" (click)="transfer()">Transfer 10</button>
    <button type="button" (click)="loadStatus()">Load status</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class LabM33CsrfBank {
  private readonly http = inject(HttpClient);
  protected readonly status = signal('Signed out');

  protected signIn(): void {
    this.http.post('/api/m33/csrf/login', null).subscribe({
      next: () => this.status.set('Signed in'),
      error: () => this.status.set('Sign-in failed'),
    });
  }

  protected transfer(): void {
    this.http.post('/api/m33/csrf/transfer', { amount: 10 }).subscribe({
      next: () => this.status.set('Transfer accepted'),
      error: (error: HttpErrorResponse) => this.status.set(`Transfer failed: ${error.status}`),
    });
  }

  protected loadStatus(): void {
    this.http.get<LabM33CsrfStatus>('/api/m33/csrf/xssi').subscribe({
      next: ({ ok }) => this.status.set(`Status ok: ${ok}`),
      error: () => this.status.set('Status failed'),
    });
  }
}
