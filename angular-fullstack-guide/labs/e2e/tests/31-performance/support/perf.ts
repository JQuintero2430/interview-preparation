// Shared helpers for module 31 (HOUSE-21). Read-only to every module-31 task.
// CDP helpers work only in Chromium: `newCDPSession` is Chromium-only.
import { readFile } from 'node:fs/promises';
import type { CDPSession, Page } from '@playwright/test';

/** Root of the `labs/angular` production build; `browser-stats.json` sits here, next to `browser/`. */
const DIST = new URL('../../../../angular/dist/labs/', import.meta.url);

/** A performance entry reduced to plain data, so it survives `page.evaluate`. */
export interface EntrySummary {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  /** Tag name of `entry.element` (LCP, element timing), when the entry has one. */
  element?: string;
  /** Layout-shift entries only. */
  value?: number;
  hadRecentInput?: boolean;
}

/** Entries of one type the page has recorded so far (a buffered `PerformanceObserver`). */
export function collectEntries(page: Page, type: string): Promise<EntrySummary[]> {
  return page.evaluate(
    (entryType) =>
      new Promise<EntrySummary[]>((resolve) => {
        const records: PerformanceEntry[] = [];
        const observer = new PerformanceObserver((list) => records.push(...list.getEntries()));
        observer.observe({ type: entryType, buffered: true });
        // Buffered entries arrive in a callback or are still queued: one task later, read both.
        setTimeout(() => {
          records.push(...observer.takeRecords());
          observer.disconnect();
          resolve(
            records.map((entry) => {
              const element = 'element' in entry && entry.element instanceof Element ? entry.element.tagName : undefined;
              const shift = 'value' in entry && typeof entry.value === 'number' ? entry.value : undefined;
              return {
                name: entry.name,
                entryType: entry.entryType,
                startTime: entry.startTime,
                duration: entry.duration,
                ...(element === undefined ? {} : { element }),
                ...(shift === undefined ? {} : { value: shift, hadRecentInput: 'hadRecentInput' in entry && entry.hadRecentInput === true }),
              };
            }),
          );
        }, 0);
      }),
    type,
  );
}

/** A Chrome DevTools Protocol session attached to the page. */
export function cdp(page: Page): Promise<CDPSession> {
  return page.context().newCDPSession(page);
}

/** Forces a full garbage collection, so counts reflect only reachable objects. */
export async function forceGc(session: CDPSession): Promise<void> {
  await session.send('HeapProfiler.collectGarbage');
}

/** How many live objects have the prototype the expression evaluates to (e.g. `'HTMLDivElement.prototype'`). */
export async function countInstances(session: CDPSession, prototypeExpression: string): Promise<number> {
  const { result: prototype } = await session.send('Runtime.evaluate', { expression: prototypeExpression });
  if (!prototype.objectId) throw new Error(`${prototypeExpression} is not an object`);
  const { objects } = await session.send('Runtime.queryObjects', { prototypeObjectId: prototype.objectId });
  const { result } = await session.send('Runtime.callFunctionOn', {
    objectId: objects.objectId!,
    functionDeclaration: 'function () { return this.length; }',
    returnByValue: true,
  });
  return Number(result.value);
}

/** The renderer's document, node and JS event listener counters. */
export async function domCounters(session: CDPSession): Promise<{ documents: number; nodes: number; jsEventListeners: number }> {
  const { documents, nodes, jsEventListeners } = await session.send('Memory.getDOMCounters');
  return { documents, nodes, jsEventListeners };
}

/** Number of event listeners registered on `window`. */
export async function windowListenerCount(session: CDPSession): Promise<number> {
  const { result: win } = await session.send('Runtime.evaluate', { expression: 'window' });
  const { listeners } = await session.send('DOMDebugger.getEventListeners', { objectId: win.objectId! });
  return listeners.length;
}

/** Reads a file of the production build, relative to `labs/angular/dist/labs` (e.g. `'browser-stats.json'`). */
export function distFile(name: string): Promise<string> {
  return readFile(new URL(name, DIST), 'utf8');
}
