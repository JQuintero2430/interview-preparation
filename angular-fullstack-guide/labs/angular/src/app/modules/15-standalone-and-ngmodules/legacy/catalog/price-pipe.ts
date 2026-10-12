import { Pipe, PipeTransform } from '@angular/core';

// Legacy: a pipe that can only be used through the NgModule that declares it.
@Pipe({ name: 'm15Price', standalone: false })
export class PricePipe implements PipeTransform {
  transform(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
