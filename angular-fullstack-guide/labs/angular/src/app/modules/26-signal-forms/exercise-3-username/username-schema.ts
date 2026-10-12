import { inject, resource } from '@angular/core';
import { debounce, minLength, required, schema, validateAsync } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { UsernameApi } from './username-api';

export interface Account {
  user: string;
}

export const USERNAME_MESSAGES: Record<string, string> = {
  required: 'Pick a username',
  minLength: 'Use at least 3 characters',
  taken: 'That username is taken',
  unavailable: 'The check is unavailable, try again',
};

/** Sync rules first, then the async check; `debounceMs` is the option of `validateAsync`. */
function usernameRules(p: SchemaPathTree<Account>, debounceMs?: number): void {
  const api = inject(UsernameApi);
  required(p.user);
  minLength(p.user, 3);
  validateAsync(p.user, {
    params: ({ value }) => value(),
    debounce: debounceMs,
    factory: (params) => resource({ params, loader: ({ params: name }) => api.isTaken(name) }),
    onSuccess: (taken) => (taken ? { kind: 'taken' } : undefined),
    onError: () => ({ kind: 'unavailable' }),
  });
}

/** The answer: the debounce option delays the validator's params. */
export const usernameSchema = schema<Account>((p) => usernameRules(p, 50));

/** The alternative: the `debounce()` rule delays the model write from the UI. */
export const usernameRuleSchema = schema<Account>((p) => {
  debounce(p.user, 50);
  usernameRules(p);
});
