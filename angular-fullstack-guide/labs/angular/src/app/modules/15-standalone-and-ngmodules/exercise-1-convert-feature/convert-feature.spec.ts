import { CommonModule } from '@angular/common';
import { Component, inject, isStandalone, NgModule, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TasksModule } from './legacy/tasks.module';
import { LegacyTaskList } from './legacy/task-list';
import { TaskItem } from './task-item';
import { TaskList } from './task-list';
import { TaskStore } from './task-store';

// Legacy (the hybrid step): a module-declared list that imports the new standalone item.
@Component({
  selector: 'lab-m15-e1-hybrid-task-list',
  standalone: false,
  template: `<ul><li *ngFor="let task of store.tasks()"><lab-m15-e1-task-item [task]="task" /></li></ul>`,
})
class HybridTaskList {
  protected readonly store = inject(TaskStore);
}

@NgModule({ declarations: [HybridTaskList], imports: [CommonModule, TaskItem], providers: [TaskStore] })
class HybridTasksModule {}

@Component({ selector: 'lab-m15-e1-home', template: '<p>home</p>' })
class Home {}

const appRoutes: Routes = [
  { path: 'tasks', loadChildren: () => import('./tasks.routes') },
  { path: 'home', component: Home },
];

function rowsOf(component: Type<unknown>): string[] {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('li');
  return Array.from(rows, (row) => row.textContent?.trim() ?? '');
}

function storeOf(harness: RouterTestingHarness, component: Type<unknown>): TaskStore {
  return harness.fixture.debugElement.query(By.directive(component)).injector.get(TaskStore);
}

describe('E15.1 Convert an NgModule feature to standalone by hand', () => {
  it('the standalone list renders the same items as the legacy module for the same store data', () => {
    TestBed.configureTestingModule({ imports: [TasksModule] });
    const legacyRows = rowsOf(LegacyTaskList);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [TaskList], providers: [TaskStore] });

    expect(legacyRows).toEqual(['done Write the specs', 'open Delete TasksModule']);
    expect(rowsOf(TaskList)).toEqual(legacyRows);
  });

  it('every solution component is standalone (isStandalone)', () => {
    expect(isStandalone(TaskList)).toBe(true);
    expect(isStandalone(TaskItem)).toBe(true);
    expect(isStandalone(LegacyTaskList)).toBe(false);
  });

  it('a test configures the solution with imports only (no declarations)', () => {
    TestBed.configureTestingModule({ imports: [TaskList], providers: [TaskStore] });

    expect(rowsOf(TaskList)).toEqual(['done Write the specs', 'open Delete TasksModule']);
  });

  it('the store is shared by the list and the items through the route and is not visible from the root (NG0201)', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks', TaskList);
    const listStore = storeOf(harness, TaskList);
    const items = harness.fixture.debugElement.queryAll(By.directive(TaskItem));

    expect(items.length).toBe(2);
    items.forEach((item) => expect(item.injector.get(TaskStore)).toBe(listStore));
    (items[1].nativeElement as HTMLElement).querySelector('button')?.click();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h3')?.textContent).toBe('0 open');
    expect(() => TestBed.inject(TaskStore)).toThrowError(/NG0201/);
  });

  it('a legacy NgModule can import the new standalone item and render it (hybrid step)', () => {
    TestBed.configureTestingModule({ imports: [HybridTasksModule] });

    expect(rowsOf(HybridTaskList)).toEqual(['done Write the specs', 'open Delete TasksModule']);
  });

  it('visiting the route twice reuses the same store', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes)] });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/tasks', TaskList);
    const first = storeOf(harness, TaskList);
    await harness.navigateByUrl('/home', Home);
    await harness.navigateByUrl('/tasks', TaskList);

    expect(storeOf(harness, TaskList)).toBe(first);
  });
});
