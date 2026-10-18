import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/** A fixed lab value, not a credential: any request that carries an `Authorization` header skips the transfer cache. */
const LAB_AUTHORIZATION = 'Bearer lab-demo-token';

interface LabMe {
  name: string;
}

/** The per-user part of the page: its response never enters the state script, so the browser asks again. */
@Component({
  selector: 'lab-m32-ex3-signed-in',
  template: `<p>Signed in as: <output aria-label="Signed in as">{{ me()?.name ?? 'checking' }}</output></p>`,
})
export class LabM32Ex3SignedIn {
  protected readonly me = toSignal(
    inject(HttpClient).get<LabMe>('/api/me', { headers: new HttpHeaders({ Authorization: LAB_AUTHORIZATION }) }),
  );
}
