/** ESM exports are LIVE bindings: importers see the current value, not a copy. */
export let count = 0;
export function increment(): void {
  count += 1;
}
