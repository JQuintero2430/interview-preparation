// Exercise 11.3: a miniature accessibility audit over a DOM subtree. Rule ids are borrowed from axe-core for familiarity; the
// implementation is this model's own, it is not axe and it is not a conformance check (WCAG needs people and a real browser).
// Not modelled: contrast, layout, target size, shadow DOM, iframes, hidden elements (an unnamed hidden button is still reported).
import { accessibleName } from './accname';
import { tabbables } from './focus-trap';

export type RuleId =
  | 'image-alt'
  | 'button-name'
  | 'link-name'
  | 'label'
  | 'duplicate-id'
  | 'aria-hidden-focus'
  | 'tabindex'
  | 'heading-order'
  | 'aria-valid-attr-value'
  | 'interactive-supports-focus';

export interface Violation {
  rule: RuleId;
  element: Element;
  message: string;
}

interface Rule {
  id: RuleId;
  message: string;
  offenders(root: ParentNode): Element[];
}

const INTERACTIVE_ROLES = ['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option'];
const NAMED_BY_LABEL = 'input:not([type="hidden"], [type="submit"], [type="button"], [type="reset"], [type="image"]), select, textarea';

const all = (root: ParentNode, selector: string): Element[] => [...root.querySelectorAll(selector)];
const unnamed = (root: ParentNode, selector: string): Element[] => all(root, selector).filter((element) => accessibleName(element) === '');

/** The name without HTML-AAM's last fallback: a placeholder is a hint, not a label. */
function nameWithoutPlaceholder(control: Element): string {
  const placeholder = control.getAttribute('placeholder');
  control.removeAttribute('placeholder');
  const name = accessibleName(control);
  if (placeholder !== null) control.setAttribute('placeholder', placeholder);
  return name;
}

function duplicateIds(root: ParentNode): Element[] {
  const seen = new Set<string>();
  return all(root, '[id]').filter((element) => {
    const repeated = seen.has(element.id);
    seen.add(element.id);
    return repeated;
  });
}

function hidesFocusable(element: Element): boolean {
  return tabbables(element.parentElement ?? element).some((candidate) => element.contains(candidate));
}

function headingLevel(heading: Element): number {
  return Number(heading.localName.slice(1));
}

function skippedHeadings(root: ParentNode): Element[] {
  const headings = all(root, 'h1, h2, h3, h4, h5, h6');
  return headings.filter((heading, index) => index > 0 && headingLevel(heading) > headingLevel(headings[index - 1] as Element) + 1);
}

function danglingReferences(root: ParentNode): Element[] {
  return all(root, '[aria-labelledby], [aria-describedby]').filter((element) =>
    ['aria-labelledby', 'aria-describedby'].some((name) =>
      (element.getAttribute(name) ?? '').split(/\s+/).filter(Boolean).some((id) => element.ownerDocument.getElementById(id) === null),
    ),
  );
}

const RULES: readonly Rule[] = [
  { id: 'image-alt', message: 'img has no alt attribute (alt="" marks decoration)', offenders: (root) => all(root, 'img:not([alt])') },
  { id: 'button-name', message: 'button has no accessible name', offenders: (root) => unnamed(root, 'button, [role="button"]') },
  { id: 'link-name', message: 'link has no accessible name', offenders: (root) => unnamed(root, 'a[href], [role="link"]') },
  { id: 'label', message: 'form control has no label', offenders: (root) => all(root, NAMED_BY_LABEL).filter((c) => nameWithoutPlaceholder(c) === '') },
  { id: 'duplicate-id', message: 'id is already used by an earlier element', offenders: duplicateIds },
  { id: 'aria-hidden-focus', message: 'aria-hidden="true" contains something focusable', offenders: (root) => all(root, '[aria-hidden="true"]').filter(hidesFocusable) },
  { id: 'tabindex', message: 'positive tabindex reorders focus', offenders: (root) => all(root, '[tabindex]').filter((e) => Number(e.getAttribute('tabindex')) > 0) },
  { id: 'heading-order', message: 'heading skips a level', offenders: skippedHeadings },
  { id: 'aria-valid-attr-value', message: 'aria-labelledby or aria-describedby points at a missing id', offenders: danglingReferences },
  {
    id: 'interactive-supports-focus',
    message: 'element with an interactive role cannot take focus',
    offenders: (root) => all(root, INTERACTIVE_ROLES.map((role) => `[role="${role}"]`).join(',')).filter((e) => !e.hasAttribute('tabindex') && (e as HTMLElement).tabIndex < 0),
  },
];

const inDocumentOrder = (a: Violation, b: Violation): number => {
  if (a.element === b.element) return 0;
  return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
};

/** Violations of the ten rules under `root`, in document order (a stable sort keeps the rule order for one element). */
export function audit(root: ParentNode = document): Violation[] {
  const found = RULES.flatMap((rule) => rule.offenders(root).map((element) => ({ rule: rule.id, element, message: rule.message })));
  return found.sort(inDocumentOrder);
}
