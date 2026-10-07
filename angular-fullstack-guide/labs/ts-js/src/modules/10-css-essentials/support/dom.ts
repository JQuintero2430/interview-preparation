// Shared jsdom helper for module 10. Needs `// @vitest-environment jsdom` in the test file.
// jsdom implements the cascade (matching, specificity, inheritance), not layout: see section-1-jsdom-limits.test.ts.

const mounted: Element[] = [];

/** Inserts a `<style>` element and the markup into the document and returns the element holding the markup. */
export function mountStyles(css: string, html: string): HTMLElement {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  mounted.push(style, root);
  return root;
}

/** Reads one property of the computed style, as jsdom reports it. */
export function computed(element: Element, property: string): string {
  return getComputedStyle(element).getPropertyValue(property);
}

/** Removes everything `mountStyles` added; call it from `afterEach`. */
export function unmount(): void {
  for (const node of mounted.splice(0)) node.remove();
}
