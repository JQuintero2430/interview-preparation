import { HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SortOrder } from '../concepts/page-params';
import { ABOUT_BLANK, type Problem, readProblem } from '../concepts/problem-details';

/** What the list asks for, whichever contract serves it: no page number, because a cursor has none. */
export interface ListQuery {
  readonly size: number;
  readonly sort: readonly SortOrder[];
  readonly filters: Readonly<Record<string, string>>;
}

/** One loaded page; `next` is the opaque position of the following page, or `null` on the last one. */
export interface ListPage<T> {
  readonly items: readonly T[];
  readonly next: string | null;
}

/** One pagination contract: loads the page at `position`, or the first page when it is `null`. */
export interface ListSource<T> {
  page(query: ListQuery, position: string | null): Observable<ListPage<T>>;
}

/** Our type URI (ours, not a standard) for a response that failed the client's check. */
export const CONTRACT_VIOLATION = 'https://api.example.com/problems/contract-violation';

/** Thrown by a source when a response body is not the contract; carries a problem the UI can show. */
export class ContractError extends Error {
  readonly problem: Problem;

  constructor(pointer: string) {
    super(`The response does not match the contract at ${pointer}`);
    this.problem = {
      type: CONTRACT_VIOLATION,
      title: 'Contract violation',
      status: undefined,
      detail: this.message,
      instance: undefined,
      errors: [{ pointer, detail: 'Unexpected value' }],
    };
  }
}

/** A failed request as a problem: the server's problem detail when the body is one, else `about:blank` with the status. */
export async function httpProblem(err: unknown): Promise<Problem> {
  const response = err instanceof HttpErrorResponse ? err : undefined;
  const fallback: Problem = {
    type: ABOUT_BLANK,
    title: undefined,
    status: response?.status,
    detail: undefined,
    instance: undefined,
    errors: [],
  };
  return (await readProblem(response?.error)) ?? fallback;
}
