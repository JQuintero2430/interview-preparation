import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from './todo';

export const TODOS_URL = '/api/todos';

@Injectable({ providedIn: 'root' })
export class TodosApi {
  private readonly http = inject(HttpClient);

  toggle(id: number, done: boolean): Observable<Todo> {
    return this.http.patch<Todo>(`${TODOS_URL}/${id}`, { done });
  }
}
