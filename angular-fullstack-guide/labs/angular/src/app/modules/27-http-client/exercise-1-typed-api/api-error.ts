import { HttpErrorResponse } from '@angular/common/http';

export type ApiError =
  | { readonly kind: 'invalid-response' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'offline' }
  | { readonly kind: 'validation'; readonly fields: Record<string, string[]> }
  | { readonly kind: 'unknown'; readonly status: number };

export class InvalidResponseError extends Error {}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function fieldsOf(body: unknown): Record<string, string[]> {
  if (typeof body !== 'object' || body === null || !('fields' in body)) return {};
  const { fields } = body;
  if (typeof fields !== 'object' || fields === null) return {};
  return Object.fromEntries(Object.entries(fields).filter((entry) => isStringArray(entry[1])));
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof InvalidResponseError) return { kind: 'invalid-response' };
  if (!(err instanceof HttpErrorResponse)) return { kind: 'unknown', status: -1 };
  if (err.status === 0) return { kind: 'offline' };
  if (err.status === 404) return { kind: 'not-found' };
  if (err.status === 422) return { kind: 'validation', fields: fieldsOf(err.error) };
  return { kind: 'unknown', status: err.status };
}
