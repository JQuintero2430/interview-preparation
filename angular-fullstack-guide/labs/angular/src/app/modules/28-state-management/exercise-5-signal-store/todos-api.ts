import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Author, Todo } from './todo';

export const TODOS_URL = '/api/todos';
export const AUTHORS_URL = '/api/authors';

@Injectable({ providedIn: 'root' })
export class LabM28TodosApi {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(TODOS_URL);
  }

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(AUTHORS_URL);
  }
}
