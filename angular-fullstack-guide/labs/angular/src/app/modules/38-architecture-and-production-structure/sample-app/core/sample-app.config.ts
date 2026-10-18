import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { sampleRoutes } from '../routes';

/** App-wide setup, configured once: core is a folder of providers, not a module. */
export const sampleAppConfig: ApplicationConfig = {
  providers: [provideRouter(sampleRoutes)],
};
