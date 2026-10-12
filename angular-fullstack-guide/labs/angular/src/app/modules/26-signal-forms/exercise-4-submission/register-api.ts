import { Injectable } from '@angular/core';

export interface Registration {
  email: string;
  username: string;
}

/** What the fake server answers: success, or the one field it rejects. */
export type RegisterResult = { ok: true } | { field: keyof Registration; message: string };

/** A fake registration service: every call is logged and `hold()` keeps the answer pending. */
@Injectable({ providedIn: 'root' })
export class RegisterApi {
  readonly calls: Registration[] = [];
  reply: RegisterResult = { ok: true };
  private gate: Promise<void> | null = null;

  /** Keeps every later call open until the returned function runs. */
  hold(): () => void {
    let release = (): void => undefined;
    this.gate = new Promise<void>((done) => {
      release = done;
    });
    return release;
  }

  async register(value: Registration): Promise<RegisterResult> {
    this.calls.push({ ...value });
    if (this.gate) {
      await this.gate;
    }
    return this.reply;
  }
}
