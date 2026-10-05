const MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** HTML-escape for text nodes and QUOTED attribute values. Not enough for URLs, JS, CSS or unquoted attributes. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => MAP[c] ?? c);
}

/** Allow-list a URL's scheme. `javascript:` survives HTML escaping, so escaping alone does not protect an href. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value, 'https://placeholder.invalid');
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
