import { Component, inject, REQUEST } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Echoes `?q=` through an interpolation and an `[innerHTML]` binding, and the `X-Lab-Name` request header. */
@Component({
  selector: 'lab-m33-ssr-echo',
  template: `
    <h2>Search results</h2>
    <p>Interpolation: <output aria-label="Interpolation">{{ query }}</output></p>
    <p>innerHTML binding: <output aria-label="innerHTML binding" [innerHTML]="query"></output></p>
    <p>Request header: <output aria-label="Request header">{{ labName }}</output></p>
  `,
})
export class LabM33SsrEcho {
  protected readonly query = inject(ActivatedRoute).snapshot.queryParamMap.get('q') ?? '';
  protected readonly labName = inject(REQUEST)?.headers.get('x-lab-name') ?? 'no request';
}
