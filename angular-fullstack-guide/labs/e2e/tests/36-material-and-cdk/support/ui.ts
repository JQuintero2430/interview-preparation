// Shared helpers for module 36 (HOUSE-35). Read-only to every module-36 task.
// They target the production build of the `material-lab` project served by server/material-server.mjs on port 4800.
// Every module-36 browser context sets `reducedMotion` and `colorScheme` explicitly ('no-preference' and 'light' unless the test is about them).
// Functions handed to `evaluate` are serialised, so each one is self-contained.
import type { BrowserContext, Locator, Page } from '@playwright/test';

/** The lab's own site. */
export const UI_ORIGIN = 'http://localhost:4800';

/** The computed value of a `--mat-sys-*` custom property on the first element matching `selector`. */
export async function sysVar(page: Page, name: string, selector = 'html'): Promise<string> {
  return page.locator(selector).first().evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop).trim(), name);
}

/** One computed style value of an element. */
export async function computed(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** One element of the top layer. */
export interface TopLayerEntry {
  tag: string;
  classes: string[];
  id: string;
}

/** Every element matching `:popover-open` or `dialog:modal`, in document order. */
export async function topLayer(page: Page): Promise<TopLayerEntry[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(':popover-open, dialog:modal')).map((el) => ({
      tag: el.tagName.toLowerCase(),
      classes: Array.from(el.classList),
      id: el.id,
    })),
  );
}

/** A bounding rectangle as plain numbers. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** `getBoundingClientRect()` of an element as plain numbers. */
export async function rect(locator: Locator): Promise<Rect> {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left };
  });
}

/** The focused element, reduced to serialisable fields (no shadow root is pierced). */
export interface ActiveElementInfo {
  tag: string;
  id: string;
  role: string | null;
  label: string | null;
  classes: string[];
}

/** `document.activeElement` as plain fields. */
export async function activeElement(page: Page): Promise<ActiveElementInfo> {
  return page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName.toLowerCase() ?? '',
      id: el?.id ?? '',
      role: el?.getAttribute('role') ?? null,
      label: el?.getAttribute('aria-label') ?? null,
      classes: Array.from(el?.classList ?? []),
    };
  });
}

/** The text of every CDK live-announcer element (class `cdk-live-announcer-element`). Read it with `expect.poll`: the write is delayed. */
export async function liveText(page: Page): Promise<string[]> {
  return page.evaluate(() => Array.from(document.querySelectorAll('.cdk-live-announcer-element')).map((el) => el.textContent ?? ''));
}

/** Drags `source` onto `target` with the mouse: a 10 px first move (the CDK's drag-start threshold), then at least 10 steps. */
export async function dragBy(page: Page, source: Locator, target: Locator): Promise<void> {
  const from = await rect(source);
  const to = await rect(target);
  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 10, startY + 10);
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** Grants the clipboard permissions for `UI_ORIGIN` (Chromium only). */
export async function grantClipboard(context: BrowserContext): Promise<void> {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: UI_ORIGIN });
}

/** The clipboard text, read in the page. */
export async function readClipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}
