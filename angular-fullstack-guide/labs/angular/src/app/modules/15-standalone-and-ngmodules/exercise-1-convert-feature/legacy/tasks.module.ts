import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TaskStore } from '../task-store';
import { LegacyTaskItem } from './task-item';
import { LegacyTaskList } from './task-list';

// Legacy (the exercise's starting point): scope, provider and re-export in one class.
@NgModule({
  declarations: [LegacyTaskList, LegacyTaskItem],
  imports: [CommonModule],
  exports: [LegacyTaskList, CommonModule],
  providers: [TaskStore],
})
export class TasksModule {}
