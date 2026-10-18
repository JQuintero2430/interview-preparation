import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// The only place in the project that provides the legacy animation package.
const legacyConfig = mergeApplicationConfig(appConfig, { providers: [provideAnimationsAsync()] });

bootstrapApplication(App, legacyConfig).catch((err) => console.error(err));
