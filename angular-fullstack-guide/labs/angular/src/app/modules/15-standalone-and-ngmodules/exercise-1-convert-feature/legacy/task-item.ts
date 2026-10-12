import { Component, inject, Input } from '@angular/core';
import { Task, TaskStore } from '../task-store';

// Legacy (the exercise's starting point): declared by TasksModule, decorator input.
@Component({
  selector: 'lab-m15-e1-legacy-task-item',
  standalone: false,
  template: `<button type="button" (click)="store.toggle(task.id)">{{ task.done ? 'done' : 'open' }}</button> {{ task.title }}`,
})
export class LegacyTaskItem {
  @Input({ required: true }) task!: Task;
  protected readonly store = inject(TaskStore);
}
