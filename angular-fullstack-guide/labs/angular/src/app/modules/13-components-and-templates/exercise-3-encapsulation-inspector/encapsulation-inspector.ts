export type EncapsulationMode = 'emulated' | 'shadow-dom' | 'none';
export type StyleLocation = 'head' | 'shadow-root' | 'none';

export interface EncapsulationReport {
  readonly mode: EncapsulationMode;
  readonly hostAttribute: string | null;
  readonly contentAttribute: string | null;
  readonly stylesIn: StyleLocation;
}

const HOST_PREFIX = '_nghost-';
const CONTENT_PREFIX = '_ngcontent-';

function attributeStartingWith(element: Element, prefix: string): string | null {
  return element.getAttributeNames().find((name) => name.startsWith(prefix)) ?? null;
}

function contentAttributeOf(host: Element): string | null {
  const names = Array.from(host.querySelectorAll('*'), (element) => attributeStartingWith(element, CONTENT_PREFIX));
  return names.find((name) => name !== null) ?? null;
}

function selectorMatches(element: Element, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

function styleReaches(style: HTMLStyleElement, elements: Element[]): boolean {
  const rules = Array.from(style.sheet?.cssRules ?? []);
  return rules.some(
    (rule) => 'selectorText' in rule && elements.some((element) => selectorMatches(element, String(rule.selectorText))),
  );
}

// Emulated styles are found by the attribute their selectors carry; None styles carry no mark,
// so they are found by a rule whose selector matches the element or something inside it.
function headStylesOf(element: Element, names: readonly string[]): HTMLStyleElement[] {
  const styles = Array.from(document.head.querySelectorAll('style'));
  if (names.length > 0) {
    return styles.filter((style) => names.some((name) => (style.textContent ?? '').includes(`[${name}]`)));
  }
  const reached = [element, ...Array.from(element.querySelectorAll('*'))];
  return styles.filter((style) => styleReaches(style, reached));
}

function locationOf(styles: HTMLStyleElement[]): StyleLocation {
  return styles.length > 0 ? 'head' : 'none';
}

export function inspectEncapsulation(host: HTMLElement): EncapsulationReport {
  if (host.shadowRoot) {
    const stylesIn = host.shadowRoot.querySelector('style') ? 'shadow-root' : 'none';
    return { mode: 'shadow-dom', hostAttribute: null, contentAttribute: null, stylesIn };
  }
  const hostAttribute = attributeStartingWith(host, HOST_PREFIX);
  const contentAttribute = contentAttributeOf(host);
  const names = [hostAttribute, contentAttribute].filter((name) => name !== null);
  const mode = hostAttribute === null ? 'none' : 'emulated';
  return { mode, hostAttribute, contentAttribute, stylesIn: locationOf(headStylesOf(host, names)) };
}

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function ownStylesOf(element: Element): HTMLStyleElement[] {
  if (element.shadowRoot || element.getRootNode() instanceof ShadowRoot) {
    return [];
  }
  const names = element.getAttributeNames().filter((name) => name.startsWith('_ng'));
  return headStylesOf(element, names);
}

// Take a's own styles out of the document and see whether b's computed value moves: a leak is a change a caused.
export function leaksInto(a: HTMLElement, b: HTMLElement, property: string): boolean {
  const name = toKebabCase(property);
  const detached = ownStylesOf(a).map((style) => ({ style, parent: style.parentNode, next: style.nextSibling }));
  const before = getComputedStyle(b).getPropertyValue(name);
  detached.forEach(({ style }) => style.remove());
  try {
    return getComputedStyle(b).getPropertyValue(name) !== before;
  } finally {
    detached.forEach(({ style, parent, next }) => parent?.insertBefore(style, next));
  }
}
