/** Shared utility with no feature knowledge: upper-cases the first letter of a feature name. */
export function pageTitle(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
