import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideSampleCore } from './core-providers';
import { sampleAppConfig } from './sample-app.config';

/** The application config a real bootstrap would use: the router setup plus the core providers, once. */
export const sampleProductionConfig: ApplicationConfig = mergeApplicationConfig(sampleAppConfig, {
  providers: [provideSampleCore()],
});
