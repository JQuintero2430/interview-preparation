// Exercise 11.2: a model of the Accessible Name and Description Computation 1.2 (W3C Working Draft, 02 October 2026) for a subset
// of HTML, with the per-element rules of HTML-AAM 4.1. It is not a browser and not a screen reader.
// Not modelled: roles that prohibit naming, the Embedded Control step, generated content, SVG `title`, `aria-description`,
// `aria-placeholder`, shadow roots and slots. Visibility is `aria-hidden="true"` or `display`/`visibility` as jsdom computes them.

export type Source = 'labelledby' | 'aria-label' | 'host' | 'content' | 'title' | 'placeholder' | 'none';

interface Result {
  text: string;
  source: Source;
}

interface Context {
  /** True inside an aria-labelledby or aria-describedby traversal: aria-labelledby is not followed again. */
  inTraversal: boolean;
  /** True when the node a traversal started from was hidden: hidden nodes below it still contribute. */
  hiddenOk: boolean;
  /** True below the root, or on a referenced node: any element contributes its content. */
  recursing: boolean;
  /** The labelled control, left out of the text of its own wrapping label. */
  skip?: Element;
}

const NAME_FROM_CONTENT_ROLES = new Set(['button', 'link', 'tab', 'menuitem', 'heading']);
const TEXT_INPUT_TYPES = new Set(['text', 'password', 'number', 'search', 'tel', 'email', 'url']);
const BUTTON_INPUT_TYPES = new Set(['button', 'submit', 'reset']);

const NONE: Result = { text: '', source: 'none' };
const flat = (text: string): string => text.replace(/\s+/g, ' ').trim();
const found = (text: string, source: Source): Result => ({ text, source });
const attr = (element: Element, name: string): string => flat(element.getAttribute(name) ?? '');

function isHidden(element: Element): boolean {
  const style = getComputedStyle(element);
  return element.getAttribute('aria-hidden') === 'true' || style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility);
}

function referenced(element: Element, attribute: string): Element[] {
  const ids = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  return ids.map((id) => element.ownerDocument.getElementById(id)).filter((ref): ref is HTMLElement => ref !== null);
}

/** The text of referenced nodes, in IDREF order, each computed as a traversal that may start on a hidden node. */
function traverse(refs: Element[]): string {
  return refs.map((ref) => compute(ref, { inTraversal: true, hiddenOk: isHidden(ref), recursing: true }).text).join(' ');
}

function labelledBy(element: Element, context: Context): Result | undefined {
  const refs = context.inTraversal ? [] : referenced(element, 'aria-labelledby');
  const text = flat(traverse(refs));
  return text ? found(text, 'labelledby') : undefined;
}

function ariaLabel(element: Element): Result | undefined {
  const text = attr(element, 'aria-label');
  return text ? found(text, 'aria-label') : undefined;
}

/** HTML-AAM: a hidden label, legend or caption provides no name. */
function hostText(host: Element | undefined, control: Element): string {
  return host && !isHidden(host) ? compute(host, { inTraversal: false, hiddenOk: false, recursing: true, skip: control }).text : '';
}

function labelsText(element: Element): string {
  const labels = 'labels' in element ? [...((element as HTMLInputElement).labels ?? [])] : [];
  return flat(labels.map((label) => hostText(label, element)).join(' '));
}

function firstChild(element: Element, tag: string): Element | undefined {
  return [...element.children].find((child) => child.localName === tag);
}

function hostLabel(element: Element): Result | undefined {
  if (element.localName === 'img') return element.hasAttribute('alt') ? found(attr(element, 'alt'), 'host') : undefined;
  const text =
    labelsText(element) ||
    (element.localName === 'fieldset' ? hostText(firstChild(element, 'legend'), element) : '') ||
    (element.localName === 'table' ? hostText(firstChild(element, 'caption'), element) : '') ||
    (isButtonInput(element) ? attr(element, 'value') : '');
  return text ? found(text, 'host') : undefined;
}

function isButtonInput(element: Element): boolean {
  return element.localName === 'input' && BUTTON_INPUT_TYPES.has(element.getAttribute('type') ?? '');
}

function isTextInput(element: Element): boolean {
  if (element.localName === 'textarea') return true;
  return element.localName === 'input' && TEXT_INPUT_TYPES.has(element.getAttribute('type') ?? 'text');
}

function allowsNameFromContent(element: Element): boolean {
  const role = element.getAttribute('role')?.trim().split(/\s+/)[0];
  if (role) return NAME_FROM_CONTENT_ROLES.has(role);
  return /^(button|summary|h[1-6])$/.test(element.localName) || (element.localName === 'a' && element.hasAttribute('href'));
}

function fromContent(element: Element, context: Context): Result | undefined {
  if (!context.recursing && !allowsNameFromContent(element)) return undefined;
  const text = [...element.childNodes].map((child) => compute(child, { ...context, recursing: true }).text).join('');
  return flat(text) ? found(text, 'content') : undefined;
}

/** The tooltip step (`title`), then, for text inputs only, HTML-AAM's last fallback, `placeholder`. */
function fallback(element: Element): Result | undefined {
  if (attr(element, 'title')) return found(attr(element, 'title'), 'title');
  return isTextInput(element) && attr(element, 'placeholder') ? found(attr(element, 'placeholder'), 'placeholder') : undefined;
}

function compute(node: Node, context: Context): Result {
  if (node.nodeType === Node.TEXT_NODE) return found(node.textContent ?? '', 'content');
  if (!(node instanceof Element) || node === context.skip) return NONE;
  if (isHidden(node) && !context.hiddenOk) return NONE;
  return labelledBy(node, context) ?? ariaLabel(node) ?? hostLabel(node) ?? fromContent(node, context) ?? fallback(node) ?? NONE;
}

const ROOT: Context = { inTraversal: false, hiddenOk: false, recursing: false };

export function accessibleName(element: Element): string {
  return flat(compute(element, ROOT).text);
}

/** `aria-describedby` texts when the attribute is present, otherwise `title` unless it already served as the name. */
export function accessibleDescription(element: Element): string {
  if (element.hasAttribute('aria-describedby')) return flat(traverse(referenced(element, 'aria-describedby')));
  const title = attr(element, 'title');
  return compute(element, ROOT).source === 'title' ? '' : title;
}
