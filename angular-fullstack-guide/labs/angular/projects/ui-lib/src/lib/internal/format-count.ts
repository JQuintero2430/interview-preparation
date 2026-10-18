/** Internal helper: not exported from public-api.ts, so it is not part of the public API. */
export function formatCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}
