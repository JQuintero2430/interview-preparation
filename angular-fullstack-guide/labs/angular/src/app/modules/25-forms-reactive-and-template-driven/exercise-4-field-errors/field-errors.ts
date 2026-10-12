import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { LAB_M25_ERROR_MESSAGES } from './error-messages';
import { shouldShowErrors } from './show-errors';

@Component({
  selector: 'lab-m25-field-errors',
  template: `
    @if (messages().length > 0) {
      <ul [id]="errorId()">
        @for (message of messages(); track message) {
          <li>{{ message }}</li>
        }
      </ul>
    }
  `,
})
export class LabM25FieldErrors {
  readonly control = input.required<AbstractControl>();
  readonly submitted = input(false);
  readonly errorId = input.required<string>();
  private readonly texts = inject(LAB_M25_ERROR_MESSAGES);
  // The public `touched` and `status` getters are untracked: the component hears the control through `events`.
  private readonly lastEvent = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null)))),
  );
  protected readonly messages = computed(() => {
    this.lastEvent();
    const control = this.control();
    if (!shouldShowErrors(control, this.submitted())) return [];
    return Object.entries(control.errors ?? {}).map(([key, payload]) => this.texts[key]?.(payload) ?? 'Invalid value');
  });
}
