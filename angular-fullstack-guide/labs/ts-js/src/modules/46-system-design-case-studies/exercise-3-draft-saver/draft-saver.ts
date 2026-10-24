// Exercise 46.3: the types both variants share (a: a class with a timer; b: a reducer plus a scheduler the test drives).
// Our model, not a library's code; `Draft` and `Answers` come from section 5's `wizard.ts`, imported read-only. The
// server, the clock and the page's visibility are injected, so a test needs no network, no real time and no browser.
import type { Answers, Draft } from '../concepts/wizard';

export type { Answers, Draft };

/** `saved`: the server has what the user sees. `unsaved`: a change is waiting or the last save failed. */
export type SaveState = 'saved' | 'saving' | 'unsaved' | 'conflict';

/** A save is conditional: the server answers `saved` only when `ifMatch` is still its current version. */
export type SaveResult =
  | { readonly status: 'saved'; readonly version: string }
  | { readonly status: 'conflict'; readonly current: Draft; readonly version: string };

export interface DraftApi {
  /** Resolves to a result, or rejects on a network error. */
  save(draft: Draft, ifMatch: string): Promise<SaveResult>;
}

/** Our stand-in for the Page Visibility API: a flag and a change listener (MDN's `hidden` and `visibilitychange`). */
export interface Visibility {
  readonly hidden: boolean;
  onChange(listener: () => void): () => void;
}

export interface Scheduler {
  /** Runs `run` once after `ms`; the returned function cancels it. */
  after(ms: number, run: () => void): () => void;
}

export interface SaverOptions {
  readonly answers: Answers;
  readonly schemaVersion: number;
  /** The version the server holds now; sent as `If-Match` on the first save. */
  readonly version: string;
  readonly pauseMs: number;
  readonly visibility: Visibility;
}

/** The server's draft and its version, shown to the user after a conflict. */
export interface Theirs {
  readonly draft: Draft;
  readonly version: string;
}

export interface DraftSaver {
  edit(answers: Answers): void;
  /** Sends the waiting answers now (after a failed save). Does nothing during a conflict. */
  retry(): void;
  /** Resolves a conflict by saving the user's answers over the server's version. */
  keepMine(): void;
  /** Resolves a conflict by adopting the server's draft. */
  takeTheirs(): void;
  state(): SaveState;
  answers(): Answers;
  savedVersion(): string;
  theirs(): Theirs | null;
  dispose(): void;
}
