import { Component, inject, input } from '@angular/core';
import { Task, TaskStore } from './task-store';

@Component({
  selector: 'lab-m15-e1-task-item',
  template: `<button type="button" (click)="store.toggle(task().id)">{{ task().done ? 'done' : 'open' }}</button> {{ task().title }}`,
})
export class TaskItem {
  readonly task = input.required<Task>();
  protected readonly store = inject(TaskStore);
}
