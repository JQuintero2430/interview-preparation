import { inject, makeStateKey, TransferState } from '@angular/core';

const STAMP = makeStateKey<string>('lab-m32-ex3-stamp');

/**
 * A value the server makes once per render: the first call writes it into the state, and the browser's first call reads it
 * back instead of making a new one.
 */
export function labM32Ex3ServerStamp(): string {
  const state = inject(TransferState);
  if (state.hasKey(STAMP)) return state.get(STAMP, '');
  const stamp = crypto.randomUUID();
  state.set(STAMP, stamp);
  return stamp;
}
