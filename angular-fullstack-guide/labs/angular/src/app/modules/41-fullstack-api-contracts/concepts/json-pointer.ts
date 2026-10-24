/** RFC 6901 §4: decode `~1` to `/` first, then `~0` to `~`, so that `~01` becomes `~1`. */
function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Splits a JSON Pointer into its decoded reference tokens. Accepts the string form (`/address/street`)
 * and the URI fragment form (`#/address/street`, percent-decoded first, RFC 6901 §6); the empty
 * pointer (the whole document) gives no tokens.
 */
export function parsePointer(pointer: string): readonly string[] {
  const path = pointer.startsWith('#') ? decodeURIComponent(pointer.slice(1)) : pointer;
  if (path === '') return [];
  if (!path.startsWith('/')) throw new Error(`Not a JSON Pointer: ${pointer}`);
  return path.slice(1).split('/').map(unescapeToken);
}
