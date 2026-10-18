import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, makeStateKey, PLATFORM_ID, resource, TransferState } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { browserStable } from './stable';

interface LabTime {
  time: string;
}

const BANNER = makeStateKey<string>('lab-banner');

/**
 * Three ways to hand a value from the server to the browser: a `TransferState` key, a `resource` with an `id`
 * and, as the control, a `resource` without one.
 */
@Component({
  selector: 'lab-m32-data-state',
  template: `
    <h2>Data: state</h2>
    <p>Banner: <output aria-label="Banner">{{ banner }}</output></p>
    <p>Time with id: <output aria-label="Time with id">{{ timeWithId.value()?.time ?? 'loading' }}</output></p>
    <p>Time without id: <output aria-label="Time without id">{{ timeWithoutId.value()?.time ?? 'loading' }}</output></p>
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
  `,
})
export class LabM32DataState {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);

  protected readonly banner = this.readBanner();
  protected readonly timeWithId = resource({ id: 'lab-time', loader: () => this.loadTime() });
  protected readonly timeWithoutId = resource({ loader: () => this.loadTime() });
  protected readonly stable = browserStable();

  /** Writes the value on the server; the browser reads it back, or falls back to its own. */
  private readBanner(): string {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      this.transferState.set(BANNER, 'written on the server');
    }
    return this.transferState.get(BANNER, 'computed in the browser');
  }

  private loadTime(): Promise<LabTime> {
    return firstValueFrom(this.http.get<LabTime>('/api/time', { transferCache: false }));
  }
}
