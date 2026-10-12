import { Pipe, PipeTransform } from '@angular/core';

// Migration sample: a shared pipe.
@Pipe({ name: 'm15Short', standalone: false })
export class ShortPipe implements PipeTransform {
  transform(value: string): string {
    return value.slice(0, 3);
  }
}
