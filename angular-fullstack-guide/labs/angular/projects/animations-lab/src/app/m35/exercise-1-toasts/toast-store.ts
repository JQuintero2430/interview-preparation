import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
}

/** The toasts on screen. Ids come from a counter, so every toast has a stable identity for `track`. */
@Injectable({ providedIn: 'root' })
export class ToastStore {
  private nextId = 1;
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  show(text: string): void {
    this.items.update((list) => [...list, { id: this.nextId++, text }]);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }
}
