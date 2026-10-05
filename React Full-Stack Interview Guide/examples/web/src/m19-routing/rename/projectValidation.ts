export const MAX_NAME_LENGTH = 40;

type NameRule = (name: string, isTaken: (name: string) => boolean) => string | null;

/** Validator map: a rule per concern, checked in order; the first message wins. */
const nameRules: NameRule[] = [
  (name) => (name ? null : 'Name is required'),
  (name) => (name.length <= MAX_NAME_LENGTH ? null : `Name must be ${MAX_NAME_LENGTH} characters or fewer`),
  (name, isTaken) => (isTaken(name) ? 'Another project already has this name' : null),
];

/**
 * Validates a project name on the server side of the action.
 * `isTaken` answers "does another project use this name?".
 * Returns the first error message, or null when the name is valid.
 */
export function validateProjectName(name: string, isTaken: (name: string) => boolean): string | null {
  for (const rule of nameRules) {
    const message = rule(name, isTaken);
    if (message) return message;
  }
  return null;
}
