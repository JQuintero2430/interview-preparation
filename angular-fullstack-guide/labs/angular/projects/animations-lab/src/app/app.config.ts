import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { recordTransition } from './view-transition-log';

// No animation provider here: the native pages must run without @angular/animations (main.legacy.ts adds it).
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({ onViewTransitionCreated: recordTransition })),
  ],
};
