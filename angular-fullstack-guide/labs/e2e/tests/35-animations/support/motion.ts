// Shared helpers for module 35 (HOUSE-33). Read-only to every module-35 task.
// They target the builds of the `animations-lab` project served by server/animations-server.mjs on port 4700.
// Every module-35 browser context sets `reducedMotion` explicitly ('no-preference' unless the test is about 'reduce').
// Functions handed to `evaluate` are serialised, so each one is self-contained: it cannot call a helper of this file.
import { readdir, readFile } from 'node:fs/promises';
import type { Locator, Page } from '@playwright/test';

/** The lab's own site. */
export const MOTION_ORIGIN = 'http://localhost:4700';

/** Root of the builds: `animations-lab/` and `animations-lab-legacy/` sit here. */
const DIST = new URL('../../../../angular/dist/', import.meta.url);

/** One animation of an element or of the document, reduced to serialisable fields. */
export interface AnimationInfo {
  kind: 'css-animation' | 'css-transition' | 'script';
  name: string;
  property: string;
  pseudoElement: string | null;
  playState: string;
  delay: number;
  iterations: number;
  fill: string;
}

/** One recorded animation or transition event. */
export interface MotionEvent {
  type: string;
  target: string;
  name: string;
}

/** Event types `recordEvents` may listen for. */
export type MotionEventType =
  | 'transitionrun'
  | 'transitionstart'
  | 'transitionend'
  | 'transitioncancel'
  | 'animationstart'
  | 'animationiteration'
  | 'animationend'
  | 'animationcancel';

/** Every event type, in the order a transition or animation can fire them. */
export const MOTION_EVENT_TYPES: readonly MotionEventType[] = [
  'transitionrun',
  'transitionstart',
  'transitionend',
  'transitioncancel',
  'animationstart',
  'animationiteration',
  'animationend',
  'animationcancel',
];

/** Runs in the page: describes each `Animation` of `source.getAnimations()`. */
function collectAnimations(source: { getAnimations(): Animation[] }): AnimationInfo[] {
  return source.getAnimations().map((animation) => {
    const timing = animation.effect?.getTiming();
    const isAnimation = animation instanceof CSSAnimation;
    const isTransition = animation instanceof CSSTransition;
    const scripted = isTransition ? 'css-transition' : 'script';
    return {
      kind: isAnimation ? 'css-animation' : scripted,
      name: isAnimation ? animation.animationName : '',
      property: isTransition ? animation.transitionProperty : '',
      pseudoElement: (animation.effect as KeyframeEffect | null)?.pseudoElement ?? null,
      playState: animation.playState,
      delay: Number(timing?.delay ?? 0),
      iterations: Number(timing?.iterations ?? 1),
      fill: String(timing?.fill ?? 'auto'),
    };
  });
}

/** The animations of one element (`element.getAnimations()`), reduced to `AnimationInfo`. */
export function animationsOf(locator: Locator): Promise<AnimationInfo[]> {
  return locator.evaluate(collectAnimations);
}

/** The animations of the whole document (`document.getAnimations()`), pseudo-elements included. */
export async function documentAnimations(page: Page): Promise<AnimationInfo[]> {
  const handle = await page.evaluateHandle(() => window.document);
  return handle.evaluate(collectAnimations);
}

/** Calls `finish()` on every finite running animation, to end it without waiting; `selector` limits it to that subtree. */
export function finishAll(page: Page, selector?: string): Promise<void> {
  return page.evaluate((scope) => {
    const root = scope ? document.querySelector(scope) : document;
    const animations = root ? root.getAnimations({ subtree: true }) : [];
    for (const animation of animations) {
      const end = animation.effect?.getComputedTiming().endTime;
      if (animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end)) animation.finish();
    }
  }, selector);
}

/** Pauses every animation of the document. */
export function pauseAll(page: Page): Promise<void> {
  return page.evaluate(() => document.getAnimations().forEach((animation) => animation.pause()));
}

/** Sets `currentTime` of every animation of the document to `ms`: a mid-animation state without waiting. */
export function seek(page: Page, ms: number): Promise<void> {
  return page.evaluate((time) => document.getAnimations().forEach((animation) => (animation.currentTime = time)), ms);
}

/** The classes of an element, in attribute order. */
export function classesOf(locator: Locator): Promise<string[]> {
  return locator.evaluate((element) => [...element.classList]);
}

/**
 * Installs listeners for `types` on every element matching `selector` and returns a reader.
 * Each call of the reader returns the events recorded so far, in firing order.
 */
export async function recordEvents(page: Page, selector: string, types: readonly MotionEventType[]): Promise<() => Promise<MotionEvent[]>> {
  await page.evaluate(
    ({ scope, names }) => {
      const log: MotionEvent[] = [];
      Object.assign(window, { labMotionEvents: log });
      for (const element of document.querySelectorAll(scope)) {
        for (const type of names) {
          element.addEventListener(type, (event) => {
            const source = event as Partial<AnimationEvent & TransitionEvent>;
            const target = (event.target as Element).tagName.toLowerCase() + (source.pseudoElement ?? '');
            log.push({ type, target, name: source.animationName ?? source.propertyName ?? '' });
          });
        }
      }
    },
    { scope: selector, names: types },
  );
  return () => page.evaluate(() => (window as unknown as { labMotionEvents: MotionEvent[] }).labMotionEvents.slice());
}

/** The text of every `.js` file of a build folder, relative to `labs/angular/dist` (e.g. `'animations-lab/browser'`), joined. */
export async function distScripts(folder: string): Promise<string> {
  try {
    const names = (await readdir(new URL(`${folder}/`, DIST))).filter((name) => name.endsWith('.js'));
    const files = await Promise.all(names.map((name) => readFile(new URL(`${folder}/${name}`, DIST), 'utf8')));
    return files.join('\n');
  } catch {
    throw new Error(`dist/${folder} is missing: run the e2e suite (its web server builds animations-lab) or "npx ng build animations-lab"`);
  }
}

/**
 * Reads a file of a build, relative to `labs/angular/dist`
 * (e.g. `distFile('animations-lab/browser/index.html')`).
 */
export async function distFile(path: string): Promise<Buffer> {
  try {
    return await readFile(new URL(path, DIST));
  } catch {
    throw new Error(`dist/${path} is missing: run the e2e suite (its web server builds animations-lab) or "npx ng build animations-lab"`);
  }
}
