import { EnvironmentProviders, ErrorHandler, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { clientHeaderInterceptor } from './client-header-interceptor';
import { LabM38ErrorHandler } from './error-handler';

/** Everything the app needs exactly once: HTTP with its interceptors and the error handler. */
export function provideSampleCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([clientHeaderInterceptor])),
    { provide: ErrorHandler, useClass: LabM38ErrorHandler },
  ]);
}
