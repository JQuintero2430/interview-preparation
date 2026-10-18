import type { Provider } from '@angular/core';
import type { Routes } from '@angular/router';
import { REPORTER, RecordingReporter } from '../../../../../../src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/reporter';
import { LabM37Ex4UpdateBannerA } from './a/update-banner';
import { LabM37Ex4UpdateBannerB } from './b/update-banner';

// The reporter is provided on the lazy routes, not in the app config, so Exercise 37.3's files load only with this exercise.
// In the lab it is the recording fake: nothing leaves the browser.
const REPORTER_PROVIDERS: Provider[] = [{ provide: REPORTER, useFactory: () => new RecordingReporter() }];

export const EX4_A_ROUTES: Routes = [{ path: '', providers: REPORTER_PROVIDERS, component: LabM37Ex4UpdateBannerA }];
export const EX4_B_ROUTES: Routes = [{ path: '', providers: REPORTER_PROVIDERS, component: LabM37Ex4UpdateBannerB }];
