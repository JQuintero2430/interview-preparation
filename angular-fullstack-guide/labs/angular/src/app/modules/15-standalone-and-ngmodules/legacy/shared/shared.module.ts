import { CommonModule } from '@angular/common';
import { inject, Injectable, InjectionToken, NgModule, Pipe, PipeTransform } from '@angular/core';

// Lets a test count module and service instances.
export const SHARED_LOG = new InjectionToken<string[]>('lab-m15-shared-log');

function record(event: string): void {
  inject(SHARED_LOG, { optional: true })?.push(event);
}

// Legacy anti-pattern: a service in the `providers` of a module imported everywhere.
@Injectable()
export class SharedLogger {
  constructor() {
    record('SharedLogger created');
  }
}

// Legacy: a declarable every feature wants.
@Pipe({ name: 'm15Shout', standalone: false })
export class ShoutPipe implements PipeTransform {
  transform(text: string): string {
    return `${text.toUpperCase()}!`;
  }
}

// Legacy: re-exports CommonModule and its own pipe, and (the anti-pattern) carries a provider.
@NgModule({
  declarations: [ShoutPipe],
  imports: [CommonModule],
  exports: [CommonModule, ShoutPipe],
  providers: [SharedLogger],
})
export class SharedModule {
  constructor() {
    record('SharedModule created');
  }
}
