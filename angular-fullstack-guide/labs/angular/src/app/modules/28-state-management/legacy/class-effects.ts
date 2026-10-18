// LEGACY: the class-based NgRx effect and its NgModule registration, module 28 §6. Before functional effects, an effect was a
// field of an @Injectable() class registered with EffectsModule; new code uses a createEffect(..., { functional: true }) constant.
import { Injectable, NgModule, inject } from '@angular/core';
import { Actions, EffectsModule, createEffect, ofType } from '@ngrx/effects';
import { createAction, props } from '@ngrx/store';
import { map } from 'rxjs';

export const labM28LegacyLoad = createAction('[Legacy Effects] Load', props<{ n: number }>());
export const labM28LegacyLoaded = createAction('[Legacy Effects] Loaded', props<{ n: number }>());

@Injectable()
export class LabM28Effects {
  private readonly actions$ = inject(Actions);

  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(labM28LegacyLoad),
      map(({ n }) => labM28LegacyLoaded({ n })),
    ),
  );
}

@NgModule({ imports: [EffectsModule.forRoot([LabM28Effects])] })
export class LabM28LegacyEffectsModule {}
