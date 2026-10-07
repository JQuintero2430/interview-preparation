// Follows the MDN "Stacking context" list (read 2026-10-06). It reads DECLARED values through getComputedStyle, so it
// works in jsdom, which computes no layout. It does not model animated values, top-layer membership or ::backdrop.

const NO_VALUE = new Set(['', 'none', 'auto', 'normal', 'visible']);
const CREATING_PROPERTIES = [
  'transform', 'scale', 'rotate', 'translate', 'filter', 'backdrop-filter', 'perspective', 'clip-path', 'mask', 'mask-image', 'mask-border',
] as const;
const WILL_CHANGE_CREATORS = new Set<string>([...CREATING_PROPERTIES, 'opacity', 'mix-blend-mode', 'isolation', 'position', 'z-index', 'contain']);

function read(style: CSSStyleDeclaration, property: string): string {
  return style.getPropertyValue(property).trim();
}

function positionReasons(style: CSSStyleDeclaration): string[] {
  const position = read(style, 'position');
  const zIndex = read(style, 'z-index');
  const reasons: string[] = [];
  if ((position === 'absolute' || position === 'relative') && !NO_VALUE.has(zIndex)) reasons.push(`position: ${position} with z-index: ${zIndex}`);
  if (position === 'fixed' || position === 'sticky') reasons.push(`position: ${position}`);
  return reasons;
}

function itemReasons(element: Element, style: CSSStyleDeclaration): string[] {
  const parent = element.parentElement;
  const zIndex = read(style, 'z-index');
  if (!parent || NO_VALUE.has(zIndex)) return [];
  const display = read(getComputedStyle(parent), 'display');
  if (display === 'flex' || display === 'inline-flex') return [`flex item with z-index: ${zIndex}`];
  if (display === 'grid' || display === 'inline-grid') return [`grid item with z-index: ${zIndex}`];
  return [];
}

function valueReasons(style: CSSStyleDeclaration): string[] {
  const reasons: string[] = [];
  const containerType = read(style, 'container-type');
  if (containerType === 'size' || containerType === 'inline-size') reasons.push(`container-type: ${containerType}`);
  const opacity = read(style, 'opacity');
  if (opacity !== '' && Number(opacity) < 1) reasons.push(`opacity: ${opacity}`);
  if (!NO_VALUE.has(read(style, 'mix-blend-mode'))) reasons.push(`mix-blend-mode: ${read(style, 'mix-blend-mode')}`);
  for (const property of CREATING_PROPERTIES) {
    if (!NO_VALUE.has(read(style, property))) reasons.push(`${property}: ${read(style, property)}`);
  }
  if (read(style, 'isolation') === 'isolate') reasons.push('isolation: isolate');
  const willChange = read(style, 'will-change').split(',').map((part) => part.trim());
  const named = willChange.find((part) => WILL_CHANGE_CREATORS.has(part));
  if (named) reasons.push(`will-change: ${named}`);
  const contain = read(style, 'contain').split(/\s+/);
  const containing = contain.find((part) => ['layout', 'paint', 'strict', 'content'].includes(part));
  if (containing) reasons.push(`contain: ${containing}`);
  return reasons;
}

/** Why `element` creates a stacking context, from its declared values; an empty array means it does not. */
export function stackingContextReasons(element: Element): string[] {
  const style = getComputedStyle(element);
  const root = element === element.ownerDocument.documentElement ? ['root element'] : [];
  return [...root, ...positionReasons(style), ...itemReasons(element, style), ...valueReasons(style)];
}

/** The nearest ancestor (not the element itself) that creates a stacking context, with its reasons. */
export function findCulprit(element: Element): { element: Element; reasons: string[] } | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const reasons = stackingContextReasons(node);
    if (reasons.length > 0) return { element: node, reasons };
  }
  return null;
}
