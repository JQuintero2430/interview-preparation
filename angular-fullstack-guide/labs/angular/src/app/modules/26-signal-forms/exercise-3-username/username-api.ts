import { Injectable } from '@angular/core';

/** A fake username service: `isTaken` is promise-based and every call is logged. */
@Injectable({ providedIn: 'root' })
export class UsernameApi {
  readonly calls: string[] = [];
  readonly takenNames = new Set(['ann']);
  delayMs = 50;
  failing = false;

  async isTaken(name: string): Promise<boolean> {
    this.calls.push(name);
    await new Promise<void>((done) => setTimeout(done, this.delayMs));
    if (this.failing) {
      throw new Error('username service is down');
    }
    return this.takenNames.has(name);
  }
}
