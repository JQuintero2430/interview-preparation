import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Todo } from './todo';

/** The feature's HTTP port: the only class that knows the URL and the body. */
@Injectable({ providedIn: 'root' })
export class TodosApi {
  private readonly http = inject(HttpClient);

  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>('/api/todos');
  }

  create(title: string): Observable<Todo> {
    return this.http.post<Todo>('/api/todos', { title });
  }
}
