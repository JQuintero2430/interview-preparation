import { computed } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

export type LabM28RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'error';

export interface LabM28RequestStatusState {
  readonly status: LabM28RequestStatus;
  readonly error: string | null;
}

/** A reusable feature: the state a request needs, and a flag derived from it. */
export function withRequestStatus() {
  return signalStoreFeature(
    withState<LabM28RequestStatusState>({ status: 'idle', error: null }),
    withComputed(({ status }) => ({ isLoading: computed(() => status() === 'pending') })),
  );
}

/** Updaters are plain functions returning a partial state, so any store can pass them to `patchState`. */
export function setPending(): LabM28RequestStatusState {
  return { status: 'pending', error: null };
}

export function setFulfilled(): LabM28RequestStatusState {
  return { status: 'fulfilled', error: null };
}

export function setError(error: string): LabM28RequestStatusState {
  return { status: 'error', error };
}
