import { Injectable } from '@angular/core';

/** Records every path a loader was asked for: `en`, `fr` for the root, `admin/en`, `admin/fr` for the admin area. */
@Injectable({ providedIn: 'root' })
export class LabM34RequestLog {
  readonly paths: string[] = [];
}
