import { Component, inject } from '@angular/core';
import { TaskStore } from '../task-store';

// Legacy (the exercise's starting point): its scope (*ngFor, the item) comes from TasksModule.
@Component({
  selector: 'lab-m15-e1-legacy-task-list',
  standalone: false,
  template: `
    <h3>{{ store.open() }} open</h3>
    <ul>
      <li *ngFor="let task of store.tasks()"><lab-m15-e1-legacy-task-item [task]="task" /></li>
    </ul>
  `,
})
export class LegacyTaskList {
  protected readonly store = inject(TaskStore);
}
