import { Component, inject } from '@angular/core';
import { TaskItem } from './task-item';
import { TaskStore } from './task-store';

@Component({
  selector: 'lab-m15-e1-task-list',
  imports: [TaskItem],
  template: `
    <h3>{{ store.open() }} open</h3>
    <ul>
      @for (task of store.tasks(); track task.id) {
        <li><lab-m15-e1-task-item [task]="task" /></li>
      }
    </ul>
  `,
})
export class TaskList {
  protected readonly store = inject(TaskStore);
}
