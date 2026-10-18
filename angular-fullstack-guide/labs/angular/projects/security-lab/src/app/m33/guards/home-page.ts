import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LabM33GuardSession } from './session';

/** Section 10: signs in as a user or an admin and opens the guarded admin route. */
@Component({
  selector: 'lab-m33-guards-home',
  imports: [RouterLink],
  template: `
    <h2>Guards lab</h2>
    <button type="button" (click)="signIn('user')">Sign in as user</button>
    <button type="button" (click)="signIn('admin')">Sign in as admin</button>
    <a routerLink="/m33/guards/admin">Open admin</a>
    <p role="status">{{ status() }}</p>
  `,
})
export class LabM33GuardsHome {
  private readonly session = inject(LabM33GuardSession);
  protected readonly status = signal('Signed out');

  protected signIn(role: string): void {
    this.session.signIn(role).subscribe((signedIn) => this.status.set(`Signed in as ${signedIn}`));
  }
}
