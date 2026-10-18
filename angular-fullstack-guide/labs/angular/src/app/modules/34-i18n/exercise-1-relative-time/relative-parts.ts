const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface RelativeParts {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}

/** Units from the largest down; the first one the distance reaches wins. Days are the last stop (months and years are not covered). */
const STEPS: readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'day', ms: DAY },
  { unit: 'hour', ms: HOUR },
  { unit: 'minute', ms: MINUTE },
  { unit: 'second', ms: SECOND },
];

/**
 * Splits a signed distance in milliseconds (later minus now: negative is the past) into a whole number of
 * the largest unit it reaches, truncated toward zero.
 */
export function toRelativeParts(diffMs: number): RelativeParts {
  const step = STEPS.find(({ ms }) => Math.abs(diffMs) >= ms) ?? STEPS[STEPS.length - 1];
  return { value: Math.trunc(diffMs / step.ms) || 0, unit: step.unit };
}

/** Milliseconds since the epoch for a Date or a number. */
export function toMs(value: Date | number): number {
  return value instanceof Date ? value.getTime() : value;
}
