import { isPlatformServer } from '@angular/common';
import { Component, inject, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const DISPLAY_NAME = makeStateKey<string>('lab-display-name');

/** Shows `?q=` as a display name: the server stores it in `TransferState`, the browser reads it back. */
@Component({
  selector: 'lab-m33-ssr-state',
  template: `
    <h2>Welcome</h2>
    <p>Display name: <output aria-label="Display name">{{ name }}</output></p>
  `,
})
export class LabM33SsrState {
  private readonly route = inject(ActivatedRoute);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly name = this.readName();

  private readName(): string {
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(DISPLAY_NAME, this.route.snapshot.queryParamMap.get('q') ?? '');
    }
    return this.transferState.get(DISPLAY_NAME, '');
  }
}
