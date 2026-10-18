import { Component, computed, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TodosStore } from './todos-store';

@Component({
  selector: 'lab-m29-todo-page',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <label for="lab-m29-new-todo">New todo</label>
      <input id="lab-m29-new-todo" formControlName="title" />
      @if (form.controls.title.touched && form.controls.title.invalid) {
        <p role="alert">Enter a title of at most 80 characters</p>
      }
      <button type="submit" [disabled]="store.status() === 'saving'">Add</button>
    </form>
    @if (store.error(); as error) {
      <p role="alert">{{ error }}</p>
    }
    @if (store.status() === 'loading') {
      <p>Loading</p>
    }
    <ul>
      @for (todo of visible(); track todo.id) {
        <li>{{ todo.title }}</li>
      }
    </ul>
  `,
})
export class LabM29TodoPage {
  /** The `q` query parameter, bound by `withComponentInputBinding()`; undefined when absent. */
  readonly q = input<string>();

  protected readonly store = inject(TodosStore);
  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
  });
  protected readonly visible = computed(() => {
    const term = (this.q() ?? '').toLowerCase();
    return this.store.todos().filter((todo) => todo.title.toLowerCase().includes(term));
  });

  constructor() {
    this.store.load();
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    if (await this.store.add(this.form.controls.title.value)) {
      this.form.reset();
    }
  }
}
