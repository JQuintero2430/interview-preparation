// INVENTED data for Q39.24, not the Update Guide's real steps. The shape is that of `Step` in the Guide's recommendations.ts
// (angular/angular adev/src/app/features/update/recommendations.ts, read 2026-10-19) without `action`; versions use the Guide's own
// numbers (18.0 is 1800, 21.0 is 2100). Our classifier (concepts/update-guide.ts) runs on it; the real Guide is not run.
import type { GuideStep } from '../concepts/update-guide';

export const guideSteps: readonly GuideStep[] = [
  { step: 'A: possible in 18.0, due in 20.0', possibleIn: 1800, necessaryAsOf: 2000, level: 2 },
  { step: 'B: possible in 20.0, due in 21.0', possibleIn: 2000, necessaryAsOf: 2100, level: 2 },
  { step: 'C: possible in 21.0, due in 22.0', possibleIn: 2100, necessaryAsOf: 2200, level: 2 },
  { step: 'D: advanced only', possibleIn: 2000, necessaryAsOf: 2100, level: 3 },
  { step: 'E: possible in 17.0, due in 19.0', possibleIn: 1700, necessaryAsOf: 1900, level: 2 },
];
