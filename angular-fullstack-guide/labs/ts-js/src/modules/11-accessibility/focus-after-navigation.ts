// A model of the three jobs after a client-side route change: set the document title, move focus to the new page's heading
// (or the main landmark) and report what was focused. It never touches the Router: calling it is the application's decision.

export interface NavigationFocusOptions {
  title?: string;
  root?: Document;
}

function focusTarget(root: Document): HTMLElement | null {
  return root.querySelector<HTMLElement>('main h1') ?? root.querySelector<HTMLElement>('main');
}

export function focusAfterNavigation({ title, root = document }: NavigationFocusOptions = {}): HTMLElement | null {
  if (title !== undefined) root.title = title;
  const target = focusTarget(root);
  if (!target) return null;
  if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus();
  return target;
}
