import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** A group validator factory: `{ dateRange }` on the group when the end text sorts before the start text. */
export function dateRange(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = textOf(group, startKey);
    const end = textOf(group, endKey);
    return start && end && end < start ? { dateRange: { start, end } } : null;
  };
}

function textOf(group: AbstractControl, key: string): string {
  const value = group.get(key)?.value;
  return typeof value === 'string' ? value : '';
}
