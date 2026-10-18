import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { LabM33TokenStore } from './token-store';

/** What `GET /api/m33/tokens/me` answers (server/security/08-tokens.mjs). */
export interface LabM33Profile {
  name: string;
}

/** Section 8: signs in, then loads the profile with whatever credential the route's store keeps. */
@Component({
  selector: 'lab-m33-tokens',
  template: `
    <h2>Token in {{ store.label }}</h2>
    <button type="button" (click)="signIn()">Sign in</button>
    <button type="button" (click)="loadProfile()">Load profile</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class LabM33TokensPage {
  private readonly http = inject(HttpClient);
  protected readonly store = inject(LabM33TokenStore);
  protected readonly status = signal('Signed out');

  protected signIn(): void {
    this.http.post<{ token?: string }>(`/api/m33/tokens/login?mode=${this.store.mode}`, null).subscribe({
      next: ({ token }) => {
        if (token) this.store.save(token);
        this.status.set('Signed in');
      },
      error: () => this.status.set('Sign-in failed'),
    });
  }

  protected loadProfile(): void {
    const token = this.store.read();
    // Attaching the header by origin and refreshing it is module 27's; here the page only sends what it kept.
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    this.http.get<LabM33Profile>('/api/m33/tokens/me', options).subscribe({
      next: ({ name }) => this.status.set(`Profile: ${name}`),
      error: (error: HttpErrorResponse) => this.status.set(`Profile failed: ${error.status}`),
    });
  }
}
