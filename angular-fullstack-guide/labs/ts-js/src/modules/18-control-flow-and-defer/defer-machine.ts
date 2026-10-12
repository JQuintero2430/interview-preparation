// Exercise 18.4: a MODEL of the @defer state rules read in the Angular 22.2.1 source (module 18 sections 5 and 9),
// not Angular's runtime. Not modeled: triggers, prefetch, hydration, dependency loading and the server. The caller
// plays the part of the trigger (`trigger`) and of the dependency load (`loaded`, `failed`).

export type DeferState = "placeholder" | "loading" | "complete" | "error";

/** A minimum or delay of 0 means "not configured", as an absent `@loading` or `@placeholder` option does. */
export interface DeferConfig {
  readonly afterMs: number;
  readonly loadingMinimumMs: number;
  readonly placeholderMinimumMs: number;
}

export interface Clock {
  now(): number;
  /** Runs the callback once after `ms`; the returned function cancels it. */
  setTimeout(callback: () => void, ms: number): () => void;
}

export interface DeferMachine {
  state(): DeferState;
  trigger(): void;
  loaded(): void;
  failed(): void;
}

const rank: Readonly<Record<DeferState, number>> = {
  placeholder: 0,
  loading: 1,
  complete: 2,
  error: 3,
};

export function createDeferMachine(config: DeferConfig, clock: Clock): DeferMachine {
  let current: DeferState = "placeholder";
  let pending: DeferState | null = null;
  let frozenUntil: number | null = null;
  let cancelAfter: (() => void) | null = null;
  let triggered = false;

  const minimumFor = (state: DeferState): number =>
    state === "placeholder"
      ? config.placeholderMinimumMs
      : state === "loading"
        ? config.loadingMinimumMs
        : 0;

  function freeze(state: DeferState): void {
    const minimum = minimumFor(state);
    if (minimum > 0) {
      frozenUntil = clock.now() + minimum;
      clock.setTimeout(release, minimum);
    }
  }

  // A freeze or the `after` delay ends: apply the one request that waited.
  function release(): void {
    const next = pending;
    frozenUntil = null;
    pending = null;
    if (next !== null) {
      request(next);
    }
  }

  function request(next: DeferState): void {
    const forward = rank[current] < rank[next] && (pending === null || rank[pending] < rank[next]);
    if (!forward) {
      return;
    }
    if (frozenUntil !== null && clock.now() < frozenUntil) {
      pending = next;
      return;
    }
    frozenUntil = null;
    if (next === "loading" && config.afterMs > 0 && cancelAfter === null) {
      pending = next;
      cancelAfter = clock.setTimeout(release, config.afterMs);
      return;
    }
    if (rank[next] > rank.loading && cancelAfter !== null) {
      cancelAfter();
      cancelAfter = null;
      pending = null;
    }
    current = next;
    freeze(next);
  }

  freeze("placeholder");

  return {
    state: () => current,
    trigger() {
      triggered = true;
      request("loading");
    },
    loaded() {
      if (triggered) {
        request("complete");
      }
    },
    failed() {
      if (triggered) {
        request("error");
      }
    },
  };
}
