import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ErrorHandler, Injectable, inject, signal, type Type } from '@angular/core';

export const PROFILE_URL = '/api/profile';

/** The data the widgets show; tests change it to break and to fix the chart. */
@Injectable({ providedIn: 'root' })
export class LabM37Ex3Data {
  readonly chartValues = signal<readonly number[]>([1, 2, 3]);
  readonly items = signal<readonly string[]>(['Ada', 'Grace', 'Linus']);
}

/** Throws while its template is checked when the data is empty or holds a negative number. */
@Component({
  selector: 'lab-m37-ex3-chart',
  template: `<p class="m37-chart">Total: {{ total() }}</p>`,
})
export class LabM37Ex3Chart {
  private readonly data = inject(LabM37Ex3Data);

  protected total(): number {
    const values = this.data.chartValues();
    if (values.length === 0) {
      throw new Error('Chart data is empty');
    }
    if (values.some((value) => value < 0)) {
      throw new Error('Bad chart data');
    }
    return values.reduce((sum, value) => sum + value, 0);
  }
}

@Component({
  selector: 'lab-m37-ex3-list',
  template: `
    <ul class="m37-list">
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
  `,
})
export class LabM37Ex3List {
  protected readonly items = inject(LabM37Ex3Data).items;
}

/** The profile is optional: a 404 is a normal answer shown inline; anything else goes to the ErrorHandler. */
@Component({
  selector: 'lab-m37-ex3-profile',
  template: `<p class="m37-profile">{{ message() }}</p>`,
})
export class LabM37Ex3Profile {
  private readonly http = inject(HttpClient);
  private readonly handler = inject(ErrorHandler);
  protected readonly message = signal('Loading profile');

  constructor() {
    this.http.get<{ readonly name: string }>(PROFILE_URL).subscribe({
      next: (profile) => this.message.set(profile.name),
      error: (error: unknown) => this.fail(error),
    });
  }

  private fail(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.message.set('No profile yet');
      return;
    }
    this.message.set('Profile unavailable');
    this.handler.handleError(error);
  }
}

/** Stable widget names for reports: a class's `name` is changed by the build (a test saw `_LabM37Ex3Chart`). */
const WIDGET_NAMES = new Map<Type<unknown>, string>([
  [LabM37Ex3Chart, 'chart'],
  [LabM37Ex3List, 'list'],
  [LabM37Ex3Profile, 'profile'],
]);

export function widgetName(type: Type<unknown>): string {
  return WIDGET_NAMES.get(type) ?? 'unknown';
}
