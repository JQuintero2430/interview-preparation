import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HookLog {
  private readonly items = signal<readonly string[]>([]);
  readonly entries = this.items.asReadonly();

  record(text: string): void {
    this.items.update((items) => [...items, text]);
  }
}
