// Our model of the multiple-major check in `@angular/cli` 22.2.1, `src/commands/update/cli.js` (read, not run). The CLI
// applies it to Angular packages: when the target major minus the installed major exceeds 1, it logs the message and
// returns 1. The installed-before-6 branch (shorter message) is left out: the fixture starts at 9. A downgrade gives a
// negative difference, so this check does not refuse it.
export function refuseJump(name: string, from: number, to: number): string | undefined {
  if (to - from <= 1) return undefined;
  const next = from + 1;
  return (
    `Updating multiple major versions of '${name}' at once is not supported. Please migrate each major version individually.\n` +
    `Run 'ng update ${name}@${next}' in your workspace directory to update to latest '${next}.x' version of '${name}'.\n\n` +
    `For more information about the update process, see https://update.angular.dev/?v=${from}.0-${next}.0`
  );
}
