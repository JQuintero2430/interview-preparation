import { InjectionToken } from '@angular/core';

/** The part of an error payload the messages read. */
export interface LabM25ErrorPayload {
  readonly requiredLength?: number;
}

export type LabM25ErrorMessages = Readonly<Record<string, (payload: LabM25ErrorPayload) => string>>;

/** Error key to message text; a form or a test can provide another map. */
export const LAB_M25_ERROR_MESSAGES = new InjectionToken<LabM25ErrorMessages>('lab-m25 error messages', {
  providedIn: 'root',
  factory: () => ({
    required: () => 'Required',
    minlength: ({ requiredLength }) => `At least ${requiredLength} characters`,
  }),
});
