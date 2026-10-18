import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from './todo';

export const TODOS_URL = '/api/todos';

/** The page's only gateway to the fixture server; provided by the route, not the root. */
@Injectable()
export class LabM30TodosApi {
  private readonly http = inject(HttpClient);

  list(q: string): Observable<Todo[]> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<Todo[]>(TODOS_URL, { params });
  }

  create(title: string): Observable<Todo> {
    return this.http.post<Todo>(TODOS_URL, { title });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${TODOS_URL}/${id}`);
  }
}
