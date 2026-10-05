import { moduleLog } from './moduleLog';

// Top-level side effect: runs once, when (and only if) this real module is evaluated.
moduleLog.push('apiConfig.ts evaluated');

export const apiBase = 'https://real.example.test';

/**
 * Describes the API this module points at.
 * @returns A sentence built from `apiBase`, read through this module's own binding, not the exports object.
 */
export function describeApi(): string {
  return `API at ${apiBase}`;
}
