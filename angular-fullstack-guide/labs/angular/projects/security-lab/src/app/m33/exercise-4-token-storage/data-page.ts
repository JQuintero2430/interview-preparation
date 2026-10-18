import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { LAB_M33_EX4_API, LabM33Ex4Auth, LabM33Ex4Session } from './auth-store';

/** What `GET data` answers (server/security/ex4-tokens-a.mjs, directly or through ex4-tokens-b.mjs). */
export interface LabM33Ex4Data {
  owner: string;
  invoices: number;
}

const LABELS: Record<LabM33Ex4Session, string> = {
  checking: 'Checking session',
  'signed-in': 'Signed in',
  'signed-out': 'Signed out',
};

/** Exercise 33.4: restores the session at start-up, then signs in, loads the user's data and signs out. */
@Component({
  selector: 'lab-m33-ex4-data',
  template: `
    <h2>Invoices</h2>
    <button type="button" (click)="auth.login()">Sign in</button>
    <button type="button" (click)="load()">Load data</button>
    <button type="button" (click)="auth.logout()">Sign out</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class LabM33Ex4DataPage {
  private readonly http = inject(HttpClient);
  private readonly api = inject(LAB_M33_EX4_API);
  protected readonly auth = inject(LabM33Ex4Auth);
  /** The last load's result, reset whenever the session changes. */
  private readonly loaded = linkedSignal<LabM33Ex4Session, string | null>({ source: this.auth.session, computation: () => null });
  protected readonly status = computed(() => this.loaded() ?? LABELS[this.auth.session()]);

  constructor() {
    this.auth.restore();
  }

  protected load(): void {
    this.http.get<LabM33Ex4Data>(`${this.api}data`).subscribe({
      next: ({ owner, invoices }) => this.loaded.set(`${owner} has ${invoices} invoices`),
      error: (error: HttpErrorResponse) => this.loaded.set(`Data failed: ${error.status}`),
    });
  }
}
