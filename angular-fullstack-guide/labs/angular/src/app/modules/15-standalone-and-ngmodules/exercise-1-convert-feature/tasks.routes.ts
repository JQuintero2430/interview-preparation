import { Routes } from '@angular/router';
import { TaskList } from './task-list';
import { TaskStore } from './task-store';

// The feature's lazy unit: a routes array whose top route owns the store.
export const TASKS_ROUTES: Routes = [{ path: '', providers: [TaskStore], component: TaskList }];

export default TASKS_ROUTES;
