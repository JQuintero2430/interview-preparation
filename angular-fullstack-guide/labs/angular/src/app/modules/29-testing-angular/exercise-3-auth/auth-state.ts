import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly current = signal<string | null>(null);

  readonly token = this.current.asReadonly();

  signIn(token: string): void {
    this.current.set(token);
  }

  signOut(): void {
    this.current.set(null);
  }
}
