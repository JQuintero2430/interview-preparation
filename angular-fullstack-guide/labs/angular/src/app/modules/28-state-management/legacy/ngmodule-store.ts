// LEGACY: the NgModule registration of NgRx Store, module 28 §4. Before the provider functions, a module imported
// StoreModule and each action was a hand-written createAction; new code uses provideStore, provideState and an action group.
import { NgModule } from '@angular/core';
import { StoreModule, createAction, createFeature, createReducer, on, props } from '@ngrx/store';

export interface LabM28LegacyTodosState {
  items: string[];
  n: number;
}

export const labM28LegacyAddTodo = createAction('[Todos Page] Add Todo', props<{ title: string }>());

export const labM28LegacyTodosFeature = createFeature({
  name: 'todos',
  reducer: createReducer<LabM28LegacyTodosState>(
    { items: [], n: 0 },
    on(labM28LegacyAddTodo, (state, { title }) => ({ ...state, items: [...state.items, title] })),
  ),
});

@NgModule({ imports: [StoreModule.forRoot({}), StoreModule.forFeature(labM28LegacyTodosFeature)] })
export class LabM28LegacyTodosModule {}
