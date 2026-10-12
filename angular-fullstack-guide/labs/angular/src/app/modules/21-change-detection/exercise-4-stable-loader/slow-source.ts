import { Injectable } from '@angular/core';

interface Deferred {
  readonly resolve: (value: string) => void;
  readonly reject: (reason: Error) => void;
}

// A fake slow backend the spec controls: a load stays pending until `settle` or `fail` is called.
@Injectable({ providedIn: 'root' })
export class SlowSource {
  private readonly waiting = new Map<string, Deferred>();

  load(key: string): Promise<string> {
    return new Promise((resolve, reject) => this.waiting.set(key, { resolve, reject }));
  }

  get pending(): readonly string[] {
    return [...this.waiting.keys()];
  }

  settle(key: string, value: string): void {
    this.waiting.get(key)?.resolve(value);
    this.waiting.delete(key);
  }

  fail(key: string, message: string): void {
    this.waiting.get(key)?.reject(new Error(message));
    this.waiting.delete(key);
  }
}
