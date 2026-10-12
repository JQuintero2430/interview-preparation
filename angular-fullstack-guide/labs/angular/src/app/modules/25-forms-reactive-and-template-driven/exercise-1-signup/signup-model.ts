import { Injectable } from '@angular/core';

/** The value both sign-up forms produce. */
export interface SignupValue {
  email: string;
  password: string;
  newsletter: boolean;
}

/** A fake sign-up endpoint: it logs every call so a test can count them. */
@Injectable({ providedIn: 'root' })
export class LabM25SignupApi {
  readonly calls: SignupValue[] = [];

  submit(value: SignupValue): void {
    this.calls.push(value);
  }
}
