import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, map, of } from 'rxjs';

export type UploadState =
  | { kind: 'progress'; percent: number }
  | { kind: 'done'; id: string }
  | { kind: 'failed'; error: unknown };

export const UPLOAD_URL = '/api/uploads';

/** Percent of the body sent so far, rounded down, so 100 means every byte left. */
export function percentOf(loaded: number, total: number): number {
  return Math.floor((loaded * 100) / total);
}

/** Uploads one blob and reports progress. The progress events exist only on the XHR backend: `withXhr()`. */
@Injectable({ providedIn: 'root' })
export class UploadService {
  protected readonly http = inject(HttpClient);

  /** Cold: nothing is sent until subscribe, and unsubscribing aborts the request. Failures become a state. */
  upload(file: Blob): Observable<UploadState> {
    return this.send(file).pipe(
      map((event): UploadState | null => this.toState(event)),
      filter((state): state is UploadState => state !== null),
      catchError((error: unknown) => of<UploadState>({ kind: 'failed', error })),
    );
  }

  protected send(file: Blob): Observable<HttpEvent<{ id: string }>> {
    return this.http.post<{ id: string }>(UPLOAD_URL, file, { reportUploadProgress: true, observe: 'events' });
  }

  private toState(event: HttpEvent<{ id: string }>): UploadState | null {
    if (event.type === HttpEventType.UploadProgress && event.total) {
      return { kind: 'progress', percent: percentOf(event.loaded, event.total) };
    }
    if (event.type === HttpEventType.Response && event.body) return { kind: 'done', id: event.body.id };
    return null;
  }
}

/** Alternative: build the `HttpRequest` by hand and send it with `request`. */
@Injectable({ providedIn: 'root' })
export class RequestUploadService extends UploadService {
  protected override send(file: Blob): Observable<HttpEvent<{ id: string }>> {
    return this.http.request<{ id: string }>(
      new HttpRequest('POST', UPLOAD_URL, file, { reportUploadProgress: true }),
    ) as Observable<HttpEvent<{ id: string }>>;
  }
}
