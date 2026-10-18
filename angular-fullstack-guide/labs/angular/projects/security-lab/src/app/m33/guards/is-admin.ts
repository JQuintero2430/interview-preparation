import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { LabM33GuardSession } from './session';

/** Section 10: matches the admin route only when the browser's copy of the role says `admin`. */
export const isAdmin: CanMatchFn = () => inject(LabM33GuardSession).role() === 'admin';
