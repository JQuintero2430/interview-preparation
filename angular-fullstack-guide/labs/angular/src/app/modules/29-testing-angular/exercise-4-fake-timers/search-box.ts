import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, from, of, switchMap } from 'rxjs';
import { SearchApi } from './search-api';

@Component({
  selector: 'lab-m29-search-box',
  template: `
    <input aria-label="Search" [value]="term()" (input)="onInput($event)" />
    <ul>
      @for (result of results(); track result) {
        <li>{{ result }}</li>
      }
    </ul>
  `,
})
export class LabM29SearchBox {
  private readonly api = inject(SearchApi);
  protected readonly term = signal('');

  protected readonly results = toSignal(
    toObservable(this.term).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => (term === '' ? of<string[]>([]) : from(this.api.search(term)))),
    ),
    { initialValue: [] },
  );

  protected onInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.term.set(event.target.value);
    }
  }
}
